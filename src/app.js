import express from "express"
import healthCheckRouter from "./routes/healthcheck.routes.js"
import userRoutes from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
const app = express();


app.use(express.json())
app.use(express.urlencoded({extended: false }))
app.use(cookieParser())

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/user", userRoutes)


export default app