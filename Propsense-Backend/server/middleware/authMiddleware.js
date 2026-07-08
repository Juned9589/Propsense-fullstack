import User from "../models/userModel.js"
import jwt from "jsonwebtoken"

const protect = async (req, res, next) => {
    try {
        let token

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({ message: "Not Authorized No Token Found" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')

        if (!req.user) {
            return res.status(401).json({ message: "User No Longer Exists" })

        }

        next()

    } catch (error) {
        return res.status(401).json({ message: "Not authorized , token failed" })

    }
}

export default protect