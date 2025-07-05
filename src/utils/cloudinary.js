import { v2 as cloudinary } from "cloudinary";

import fs from "fs";
import dotenv from "dotenv"

dotenv.config()

// configure cloudinary

cloudinary.config({
    cloud_name: process.env.CLODINARY_CLOUD_NAME,
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECRET,
});

const uploadoncloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null
        const response = await cloudinary.uploader.upload(
            localfilepath, {
            resource_type: "auto",
        }
        )
        console.log("Fill uploaded on cloudinary.File src:" + response.url)
        // fs.unlinkSync(localfilepath)
        return response

    } catch (error) {
        console.log("error on cloudinary",error)
        fs.unlinkSync(localfilepath)
        return null

    }
}

const deletefromcloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("File deleted from cloudinary")
    } catch (error) {
        console.log("Error deleting file from cloudinary", error)
        return null
    }

}

export { uploadoncloudinary , deletefromcloudinary }


