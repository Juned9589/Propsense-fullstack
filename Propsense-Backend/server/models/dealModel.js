import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled'],
        default: 'pending'
    },
    offeredPrice: {
        type: Number,
        required: true
    },
    finalPrice: {
        type: Number,

    },
    documents: [{
        name: String,
        url: String,
        publicId: String,
        docType: {
            type: String,
            enum: ['agreement', 'id_proof', 'inspection', 'other'],
            default: 'other',
        },
        clauses: [mongoose.Schema.Types.Mixed]
    }],
    timeline: [{
        event: String,
        note: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

const Deal = mongoose.model('Deal', dealSchema)

export default Deal