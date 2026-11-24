import app from "./src/app.js";
import db from "./src/db/db.js";
import dotenv from "dotenv"
dotenv.config()
db();



app.listen(5000,()=>{
    console.log("server is running");  
})

