import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    phone: {
        type: Number,
        required: true,
        default: ''
    },
    role: {
        type: String,
        enum: ['agent', 'buyer', 'admin'],
        default: 'buyer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        default: ''
    },
    favorites: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Property'
        }
    ],
    preferences: {
        description: String,
        vector: [Number],
        budget: String,
        propertytypes: [String],
        preferredcities: [String],
        minbedrooms: Number
    },
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true
})

//Hash Password Before Saving

userSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return
    this.password = await bcrypt.hash(this.password, 12)

})


//Compare Password Method 
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("User", userSchema)

export default User