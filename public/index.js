import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import circularJson from "circular-json"
import stripeNotif from "../router/router.js"
import { productDetails , userDetails } from "../db/schema.js"
import "../connections/conn.js"




const app = express()
const port = process.env.PORT || 5501
 app.use(cors())
 app.use(express.json())

 app.get("/" , (req,res)=>{
    res.status(200).json(circularJson.stringify("Money"))
 })

 app.use("/stripe" , stripeNotif)


 
 app.listen(port ,()=>{
    console.log("Money incoming on port : ", port)
 })