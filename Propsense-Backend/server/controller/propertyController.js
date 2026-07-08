import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.js";
import Notification from "../models/notificationModel.js";
import Property from "../models/propertyModel.js";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper: returns undefined if value is missing or NaN
const safeNum = (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const n = Number(val);
    return isNaN(n) ? undefined : n;
};

// GET /api/properties
export const getProperties = asyncHandler(async (req, res) => {
    const {
        minPrice, maxPrice, bedrooms, type, status,
        amenities, page = 1, limit = 10,
        lat, lng, radius, bbox
    } = req.query;


    // Allow owners and admins to see unapproved properties, but public only see approved
    let filter = { isApproved: true };
    if (req.user) {
        if (req.user.role === 'admin') {
            filter = {}; // Admin sees all
        } else {
            filter = { 
                $or: [
                    { isApproved: true },
                    { agent: req.user._id }
                ]
            };
        }
    }

    // Price filter
    const parsedMinPrice = safeNum(minPrice);
    const parsedMaxPrice = safeNum(maxPrice);
    if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
        filter.price = {};
        if (parsedMinPrice !== undefined) filter.price.$gte = parsedMinPrice;
        if (parsedMaxPrice !== undefined) filter.price.$lte = parsedMaxPrice;
    }

    // Bedrooms filter
    const parsedBedrooms = safeNum(bedrooms);
    if (parsedBedrooms !== undefined) filter.bedrooms = parsedBedrooms;

    // String filters
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Amenities filter
    if (amenities) {
        filter.amenities = {
            $all: Array.isArray(amenities) ? amenities : amenities.split(',')
        };
    }

    // Radius search
    const parsedLat = safeNum(lat);
    const parsedLng = safeNum(lng);
    const parsedRadius = safeNum(radius) ?? 10;

    if (parsedLat !== undefined && parsedLng !== undefined && !bbox) {
        filter.location = {
            $near: {
                $geometry: { type: 'Point', coordinates: [parsedLng, parsedLat] },
                $maxDistance: parsedRadius * 1000
            }
        };
    }

    // Bounding box search
    if (bbox) {
        const bboxNums = (Array.isArray(bbox) ? bbox : bbox.split(',')).map(Number);
        const hasInvalidBbox = bboxNums.length !== 4 || bboxNums.some(isNaN);

        if (!hasInvalidBbox) {
            const [swLng, swLat, neLng, neLat] = bboxNums;
            filter.location = {
                $geoWithin: {
                    $box: [[swLng, swLat], [neLng, neLat]]
                }
            };
        } else {
            return res.status(400).json({ message: 'Invalid bbox format. Expected: swLng,swLat,neLng,neLat' });
        }
    }

    // Pagination
    const parsedPage = safeNum(page) ?? 1;
    const parsedLimit = safeNum(limit) ?? 10;
    const skip = (parsedPage - 1) * parsedLimit;

    const [properties, total] = await Promise.all([
        Property.find(filter)
            .populate('agent', 'name email avatar phone')
            .skip(skip)
            .limit(parsedLimit)
            .sort({ createdAt: -1 }),
        Property.countDocuments(filter)
    ]);

    res.json({ properties, total, page: parsedPage });
});

// GET /api/properties/featured
export const getFeaturedProperties = asyncHandler(async (req, res) => {
    let properties = await Property.find({ isFeatured: true })
        .limit(3)
        .populate('agent', 'name email avatar')
        .sort({ createdAt: -1 });

    // Fallback: if no featured properties, return the 3 most recent
    if (!properties || properties.length === 0) {
        properties = await Property.find()
            .limit(3)
            .populate('agent', 'name email avatar')
            .sort({ createdAt: -1 });
    }

    res.json({ properties });
});

// GET /api/properties/favorites
export const getFavorites = asyncHandler(async (req, res) => {

    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, no token' })
    }

    const user = await User.findById(req.user._id).populate({
        path: 'favorites',
        populate: { path: 'agent', select: 'name email avatar' }
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    res.json({ favorites: user.favorites });
});

//GET /api/properties/agents/my
export const getMyListings = asyncHandler(async (req, res) => {
    const properties = await Property.find({ agent: req.user._id }).sort({
        createdAt: -1
    })
    console.log(properties)
    res.json({ properties })
})

//GET /api/properties/:id
export const getPropertybyId = asyncHandler(async (req, res) => {
    const property = await Property.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true }
    ).populate('agent', 'name email avatar phone')

    if (!property) {
        return res.status(404).json({ message: 'Property not found' })
    }
    res.json({ property })
})

//GET  /api/properties/similar/:id
export const getSimilarProperties = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id)

    if (!property) {
        return res.status(404).json({ message: 'Property not found' })
    }
    const properties = await Property.find({
        _id: { $ne: property._id },
        type: property.type,
        price: {
            $gte: property.price * 0.7,
            $lte: property.price * 1.3
        },
        bedrooms: {
            $gte: property.bedrooms - 1,
            $lte: property.bedrooms + 1
        },
    }).limit(4)
    res.json({ properties })
})


//POST create property
export const createProperty = asyncHandler(async (req, res) => {
    const {
        title, price, type, bedrooms, bathrooms,
        sqft, lat, lng, address, amenities, yearBuilt,
    } = req.body

    // Upload Images To Cloudinary
    const images = []
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, 'propsense/properties')
            images.push({ url: result.secure_url, publicId: result.public_id })
        }
    }

    // Map address fields to model schema (street, city, state, pincode)
    const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
    
    const property = await Property.create({
        title,
        price,
        type,
        bedrooms,
        bathrooms,
        sqft,
        yearBuilt,
        images,
        amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities ?? []),
        address: {
            street: parsedAddress?.address || parsedAddress?.street,
            city: parsedAddress?.city,
            state: parsedAddress?.state,
            pincode: parsedAddress?.zipCode || parsedAddress?.pincode
        },
        location: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
        },
        agent: req.user._id,
    })

    // --- REAL-TIME AI EMBEDDING ---
    try {
        const { getEmbedding } = await import('../config/groq.js');
        const text = `${title} ${type} in ${parsedAddress?.city}. ${bedrooms} beds, ${sqft} sqft. ${amenities}`;
        property.descriptionVector = await getEmbedding(text);
        await property.save();
    } catch (error) {
        console.error("AI Embedding failed on creation:", error.message);
    }

    res.status(201).json({ property })
})



export const updateProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id)

    if (!property) {
        return res.status(404).json({ message: 'Property not found' })
    }

    const isOwner = property.agent.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to update this property' })
    }

    const { lat, lng, address, amenities, status } = req.body;
    const updateData = { ...req.body };

    // Prevent agents from approving their own properties
    if (req.user.role !== 'admin') {
        delete updateData.isApproved;
    }

    // Ensure status is valid (available, under_offer, sold)
    if (status) {
        const validStatuses = ['available', 'under_offer', 'sold'];
        if (!validStatuses.includes(status)) {
            delete updateData.status; // Ignore invalid status
        }
    }

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
        const newImages = [];
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, 'propsense/properties');
            newImages.push({ url: result.secure_url, publicId: result.public_id });
        }
        // If the client wants to replace all images, they'd send a flag, 
        // but typically we append or handle via separate addImages endpoint.
        // For a general update, we'll append to the existing images.
        updateData.$push = { images: { $each: newImages } };
    }

    // Gracefully handle strings/objects from various clients
    if (typeof amenities === 'string') {
        try { updateData.amenities = JSON.parse(amenities); } catch (e) {}
    }
    
    if (address) {
        const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
        updateData.address = {
            street: parsedAddress?.address || parsedAddress?.street,
            city: parsedAddress?.city,
            state: parsedAddress?.state,
            pincode: parsedAddress?.zipCode || parsedAddress?.pincode
        };
    }

    if (lat !== undefined && lng !== undefined) {
        updateData.location = {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
        };
    }

    // Remove fields that shouldn't be in the root if they are being handled by $push or special mapping
    delete updateData.images; 
    delete updateData.lat;
    delete updateData.lng;

    const updated = await Property.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    })

    // --- REAL-TIME AI EMBEDDING UPDATE ---
    try {
        const { getEmbedding } = await import('../config/groq.js');
        const text = `${updated.title} ${updated.type} in ${updated.address?.city}. ${updated.bedrooms} beds, ${updated.sqft} sqft. ${updated.amenities?.join(', ')}`;
        updated.descriptionVector = await getEmbedding(text);
        await updated.save();
    } catch (error) {
        console.error("AI Embedding failed on update:", error.message);
    }

    res.json({ property: updated })
})

//POST /api/properties/:id/images
export const addImages = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id)

    if (!property) {
        return res.status(404).json({ message: 'Property not found' })
    }
    const newImages = []
    for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'propsense/properties')
        newImages.push({ url: result.secure_url, publicId: result.public_id })
    }
    property.images.push(...newImages)
    await property.save()

    res.json({ property })
})

//DELETE /api/properties/:id/images/:imgId
export const deleteImage = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id)

    if (!property) {
        return res.status(404).json({ message: 'Property not found' })
    }

    const image = property.images.id(req.params.imgId)

    if (!image) {
        return res.status(404).json({ message: 'Image not found' })
    }

    await deleteFromCloudinary(image.publicId)
    image.deleteOne()
    await property.save()

    res.json({ message: 'Image deleted', property })
})

//POST /api/properties/:id/favorite
export const toggleFavorite = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    const propertyId = req.params.id

    const alreadyFavorited = user.favorites.includes(propertyId)

    if (alreadyFavorited) {
        user.favorites = user.favorites.filter(
            (id) => id.toString() !== propertyId
        )
    } else {
        user.favorites.push(propertyId)
    }
    await user.save()
    res.json({ favorited: !alreadyFavorited })
})

//POST /api/properties/:id/contact
export const contactAgent = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id).populate('agent', 'name email')

    if (!property) {
        return res.status(404).json({ message: 'Property not found' })
    }

    await Notification.create({
        user: property.agent._id,
        title: 'New Property Inquiry',
        message: `${req.user.name} is interested in "${property.title}". ${req.body.message || ''}`,
        type: 'property',
        link: `/properties/${property._id}`
    })
    res.json({ message: 'Agent notified successfully', agentEmail: property.agent.email })
})

//DELETE /api/properties/:id
export const deleteProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id)

    if (!property) {
        return res.status(404).json({ message: 'Property not found' })
    }
    const isOwner = property.agent.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to delete this property' })
    }
    //DELETE all images from cloudinary
    for (const image of property.images) {
        await deleteFromCloudinary(image.publicId)
    }
    await property.deleteOne()
    res.json({ message: 'Property deleted successfully' })
})

// POST /api/properties/:id/approve
export const togglePropertyApproval = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const updatedProperty = await Property.findByIdAndUpdate(
        req.params.id,
        { isApproved: !property.isApproved },
        { new: true, runValidators: false }
    );

    res.json({ isApproved: updatedProperty.isApproved, property: updatedProperty });
});

const propertyController = {
    getProperties,
    getFeaturedProperties,
    getFavorites,
    getMyListings,
    getPropertybyId,
    getSimilarProperties,
    createProperty,
    updateProperty,
    addImages,
    deleteImage,
    toggleFavorite,
    contactAgent,
    deleteProperty,
    togglePropertyApproval,
}

export default propertyController