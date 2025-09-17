import dotenv from "dotenv"
import connectDB from "./src/db/index";
import {app} from './app';

dotenv.config({
    path: './.env.local'
})



connectDB()
.then(() => {
    app.listen(process.env['PORT'] || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env['PORT']}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
