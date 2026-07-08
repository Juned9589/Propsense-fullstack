import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true

    },
    price: {
        type: Number,
        required: true,

    },
    type: {
        type: String,
        enum: ['apartment', 'villa', 'plot', 'commercial', 'flat'],
        required: true,

    },
    status: {
        type: String,
        enum: ['available', 'under_offer', 'sold'],
        default: 'available'

    },
    bedrooms: Number,
    bathrooms: Number,
    sqft: Number,
    yearBuilt: Number,
    amenities: [String],
    images: [
        {
            url: String,
            publicId: String
        }
    ],
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    descriptionVector: {
        type: [Number], // for AI vector search
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    views: {
        type: Number,
        default: 0,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
})

propertySchema.index({ location: '2dsphere' })

const Property = mongoose.model("Property", propertySchema)

export default Property