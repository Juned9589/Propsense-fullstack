
import Property from "../models/propertyModel.js";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.js";


//PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone },
        { new: true, runValidators: true }
    )

    res.json({ user })
})



//POST /api/users/avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' })
    }

    //DELETE old avatar from Cloudinary if exists
    if (req.user.avatar) {
        const publicId = req.user.avatar.split('/').pop().split('.')[0]
        await deleteFromCloudinary(`propsense/avatars/${publicId}`)
    }
    const result = await uploadToCloudinary(req.file.buffer, 'propsense/avatars')


    if (!result || !result.secure_url) {
        return res.status(500).json({ message: "Upload failed" })
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: result.secure_url },
        { new: true }
    )
    res.status(200).json({ user })
})

//GET /api/users/agents
export const getAgents = asyncHandler(async (req, res) => {
    const agents = await User.find({ role: 'agent' }).select(
        'name email avatar phone createdAt'
    )
    res.json({ agents })
})

//GET /api/users/agents/:id
export const getAgentById = asyncHandler(async (req, res) => {
    const agent = await User.findById(req.params.id).select(
        'name email avatar phone createdAt role'
    )
    if (!agent || agent.role !== 'agent') {
        return res.status(404).json({ message: 'Agent not found' })
    }

    const listings = await Property.find({
        agent: agent._id,
        status: 'available',
    }).select('title price image address bedrooms type')

    res.json({ agent, listings })
})

//GET /api/users (Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 20 } = req.query

    const filter = role ? { role } : {}
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
        User.find(filter).skip(skip).limit(Number(limit)),
        User.countDocuments(filter)
    ])
    res.json({ users, total })
})

//DELETE /api/users/:id (Admin Only)
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    await user.deleteOne()
    res.json({ message: 'User delete successfully' })
})



// PATCH /api/users/:id/role (Admin Only)
export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!['buyer', 'agent', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
});

// PATCH /api/users/:id/status (Admin Only)
export const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ user });
});

const userController = { 
    deleteUser, 
    getAgentById, 
    getAgents, 
    getAllUsers, 
    updateProfile, 
    uploadAvatar,
    updateUserRole,
    toggleUserStatus
}

export default userController