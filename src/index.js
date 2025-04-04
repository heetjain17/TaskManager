import app from "./app.js"
import dotenv from "dotenv"
import dbConnect from "./db/dbConnect.js";

dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT;

dbConnect()
    .then(() => {
        app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`))
    })
