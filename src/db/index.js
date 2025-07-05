import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectdb = async () => {

    try {
       const connectionintance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`Mongodb Connected ! DB host: ${connectionintance.connection.host}`)
    } catch (error) {
        console.log("Mongodb connecting error", error);
        process.exit(1)

    }

}
export default connectdb;