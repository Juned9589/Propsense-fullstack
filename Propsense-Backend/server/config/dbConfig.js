
import colors from "colors";
import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected : ${conn.connection.name}`.bgGreen.black)
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`.bgRed.white)
        process.exit(1)
    }
}

export default connectDB