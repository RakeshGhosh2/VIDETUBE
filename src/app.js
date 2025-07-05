import express from "express"

import cors from "cors"

import cookieParser from "cookie-parser"

const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

// common middleware
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))

//import routes

import healthchekrouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import { errorhandler } from "./middlerwares/error.middleware.js"


//routes

app.use("/api/v1/healthcheck", healthchekrouter)
app.use("/api/v1/users", userRouter)

app.use(errorhandler)

export { app }

