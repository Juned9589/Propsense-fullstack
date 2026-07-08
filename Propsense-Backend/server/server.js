import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// ⚠️ These 3 must come FIRST before anything else
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config()
import dns from "node:dns/promises"
// Now import everything else AFTER dotenv is loaded
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import connectDB from './config/dbConfig.js'
import "./config/cloudinary.js"

import authRoutes from './routes/authRoutes.js'  // ✅ fixed path
import userRoutes from './routes/userRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import dealRoutes from './routes/dealRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
dns.setServers(["8.8.8.8", "1.1.1.1"])

connectDB()



const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
    origin: process.env.CLIENT_URL || ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/deals', dealRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/ai', aiRoutes)

// // Serve React in production
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '../../client/dist')))
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'))
//     })
// }

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))