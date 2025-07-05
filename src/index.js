import dotenv from "dotenv"

import { app } from "./app.js"
import connectdb from "./db/index.js"

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 7000

connectdb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.log("Mongodb connection error ", err)
    })