import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.js";
import Deal from "../models/dealModel.js";
import Notification from "../models/notificationModel.js";
import asyncHandler from "../utils/asyncHandler.js";

//POST /api/deals
export const createDeal = asyncHandler(async (req, res) => {
    const { propertyId, offeredPrice, offerAmount, agentId, notes } = req.body;

    const price = offeredPrice || offerAmount; // support both field names from frontend

    if (!price) {
        return res.status(400).json({ message: 'offeredPrice is required' });
    }

    // Look up the property to get the agent if agentId not supplied
    let resolvedAgentId = agentId;
    if (!resolvedAgentId) {
        const Property = (await import('../models/propertyModel.js')).default;
        const property = await Property.findById(propertyId).select('agent');
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        resolvedAgentId = property.agent;
    }

    if (!resolvedAgentId) {
        return res.status(400).json({ message: 'Could not determine agent for this property' });
    }

    const deal = await Deal.create({
        property: propertyId,
        buyer: req.user._id,
        agent: resolvedAgentId,
        offeredPrice: price,
        notes,
        timeline: [
            {
                event: "Deal Initiated",
                note: notes || 'Buyer submitted an inquiry',
                createdBy: req.user._id
            }
        ]
    });

    await Notification.create({
        user: resolvedAgentId,
        title: 'New Deal Inquiry',
        message: `${req.user.name} has initiated a deal inquiry with an offer of ₹${price}`,
        type: 'deal',
        link: `/deals/${deal._id}`
    });
    res.status(201).json({ deal });
});

//GET /api/deals
export const getDeals = asyncHandler(async (req, res) => {
    const filter =
        req.user.role === 'agent'
            ? { agent: req.user._id }
            : { buyer: req.user._id }

    const deals = await Deal.find(filter)
        .populate('property', 'title price images address')
        .populate('buyer', 'name  email avatar')
        .populate('agent', 'name  email avatar')
        .sort({ createdAt: -1 });

    res.json({ deals })
})

//GET /api/deals/:id
export const getDealById = asyncHandler(async (req, res) => {
    const deal = await Deal.findById(req.params.id)
        .populate('property')
        .populate('buyer', 'name email avatar phone')
        .populate('agent', 'name email avatar phone')
        .populate('timeline.createdBy', 'name avatar')

    if (!deal) {
        return res.status(404).json({ message: 'Deal not found' })
    }
    res.status(200).json({ deal })
})

//GET /api/deals/:id/timeline
export const getDealTimeline = asyncHandler(async (req, res) => {
    const deal = await Deal.findById(req.params.id).populate(
        'timeline.createdBy',
        'name avatar role'
    )

    if (!deal) {
        return res.status(404).json({ message: 'Deal not found' })
    }

    res.status(200).json({ timeline: deal.timeline })
})

//PUT /api/deals/:id/status
export const updateDealStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body

    const deal = await Deal.findById(req.params.id)

    if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
    }
    deal.status = status
    deal.timeline.push({
        event: `Status changed to ${status}`,
        note: note || '',
        createdBy: req.user._id
    })

    await deal.save()

    //Notify the other party
    const notifyUser =
        req.user._id.toString() === deal.buyer.toString()
            ? deal.agent
            : deal.buyer

    await Notification.create({
        user: notifyUser,
        title: 'Deal status updated',
        message: `Deal status has been changed to ${status} , ${note || ''}`,
        type: 'deal',
        link: `/deals/${deal._id}`
    })

    res.status(200).json({ deal })
})

//PUT /api/deals/:id/offer
export const updateOffer = asyncHandler(async (req, res) => {
    const { offeredPrice, note } = req.body

    const deal = await Deal.findById(req.params.id)

    if (!deal) {
        return res.status(404).json({ message: 'Deal not found' })
    }

    deal.offeredPrice = offeredPrice
    deal.timeline.push({
        event: `Counter offer submitted : ₹${offeredPrice}`,
        note: note || '',
        createdBy: req.user._id
    })

    await deal.save()

    //Notify the other party
    const notifyUser =
        req.user._id.toString() === deal.buyer.toString()
            ? deal.agent
            : deal.buyer;

    await Notification.create({
        user: notifyUser,
        title: 'New Counter Offer',
        message: `A counter offer of ₹${offeredPrice} has been submitted.`,
        type: 'deal',
        link: `/deals/${deal._id}`,
    })
    res.status(200).json({ deal });
})

//POST /api/deals/:id/documents
export const uploadDocument = asyncHandler(async (req, res) => {
    const deal = await Deal.findById(req.params.id)

    if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file provided' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'propsense/documents')

    deal.documents.push({
        name: req.body.name || req.file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        docType: req.body.docType?.trim() || 'other',
    })

    deal.timeline.push({
        event: 'Document Uploaded',
        note: `${req.body.name || req.file.originalname} was added to the vault`,
        createdBy: req.user._id,
    });

    await deal.save()

    res.status(200).json({ deal })
})

//POST /api/deals/:id/documents/:i/extract
export const extractClauses = asyncHandler(async (req, res) => {
    const deal = await Deal.findById(req.params.id)

    if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
    }

    // AI clause extraction is handled in ai.controller.js
    // Here we just save the result back to the document
    const docIndex = req.params.i
    const { clauses } = req.body

    if (deal.documents[docIndex]) {
        deal.documents[docIndex].clauses = clauses
        await deal.save()
    }

    res.status(200).json({ clauses, deal })
})

//DELETE /api/deal/:id/documents/:docId
export const deleteDocument = asyncHandler(async (req, res) => {
    const deal = await Deal.findById(req.params.id)

    if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
    }

    const doc = deal.documents.id(req.params.docId)

    if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
    }

    await deleteFromCloudinary(doc.publicId)
    doc.deleteOne()
    await deal.save()

    res.status(200).json({ message: 'Document deleted successfully', deal })
})

//GET /api/deals/:id/bundle
export const downloadDealBundle = asyncHandler(async (req, res) => {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
    }

    if (!deal.documents || deal.documents.length === 0) {
        return res.status(400).json({ message: 'No documents found to bundle' });
    }

    const archiver = (await import('archiver')).default;

    res.attachment(`deal-bundle-${deal._id}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
        console.error('Archiver error:', err);
        if (!res.headersSent) {
            res.status(500).send({ error: err.message });
        }
    });

    archive.pipe(res);

    for (const doc of deal.documents) {
        try {
            // Using global fetch (Node 18+) instead of axios to avoid missing dependency
            const response = await fetch(doc.url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            const fileName = doc.name.includes('.') ? doc.name : `${doc.name}.pdf`;
            archive.append(Buffer.from(arrayBuffer), { name: fileName });
        } catch (error) {
            console.error(`Failed to add ${doc.name} to zip:`, error.message);
        }
    }

    await archive.finalize();
});

const dealController = {
    createDeal,
    getDeals,
    getDealById,
    getDealTimeline,
    updateDealStatus,
    updateOffer,
    uploadDocument,
    extractClauses,
    deleteDocument,
    downloadDealBundle
}

export default dealController