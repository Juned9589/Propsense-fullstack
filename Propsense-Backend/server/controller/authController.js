import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from "../models/userModel.js"
import asyncHandler from "../utils/asyncHandler.js"

//Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

//POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password, role } = req.body
    if (!name || !email || !phone || !password || !role) {
        return res.status(400).json({ message: "Fill All DETAILS" })
    }
    console.log(req.body)

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return res.json(400).json({ message: "Email already registered" })
    }

    const user = await User.create({ name, email, phone, password, role })
    const token = generateToken(user._id)

    res.status(201).json({
        token,
        user: {
            _id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role
        }
    })
})


//POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    console.log(req.body)
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ Message: "Invalid email or password" })
    }

    if (user.isActive === false) {
        return res.status(403).json({ message: "Your account has been deactivated. Please contact support." })
    }

    const token = generateToken(user._id)

    res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    })
})

//Get /api/auth/me 
export const getme = asyncHandler(async (req, res) => {
    res.json({ user: req.user })
})

//PUT /api/auth/preferences
export const savePreferences = asyncHandler(async (req, res) => {
    const { description, budget, propertyTypes, preferredCities, minBedrooms, propertytypes, preferredcities, minbedrooms } = req.body

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            preferences: {
                description,
                budget,
                propertyTypes: propertyTypes || propertytypes,
                preferredCities: preferredCities || preferredcities,
                minBedrooms: minBedrooms || minbedrooms,
            },
        },
        { new: true }
    );

    res.json({ user });
})

//POST /api/auth/forget-password
export const forgetPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).json({ message: 'No user with that mail' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')

    user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')


    user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 min

    await user.save({ validateBeforeSave: false })

    res.json({ message: 'Reset token genrated', resetToken })
})

//Post /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })
    if (!user) {
        res.status(400).json({ message: 'Token is invalid or has expired' })
    }
    user.password = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    const token = generateToken(user._id)
    res.json({ token, message: 'Password reset successful' })
})

//PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ message: "Current password is incorrect" })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
})

const authController = { generateToken, registerUser, loginUser, getme, savePreferences, forgetPassword, resetPassword, changePassword }

export default authController
