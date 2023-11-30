import express from "express"
import {listsubscriptions,deleteProduct,sendInvoice,createInvoice,adminKeyValidation,cancelSubs,createCustomer,getSubscription, createProduct , updateProd , createSession , updateSubs } from "../route/route.js"
const router = express.Router()

//Admin Key Validation
router.get("/validate" , adminKeyValidation )


//Endpoint on Admin Side
router.post("/product" , createProduct)
router.put("/updateproduct" , updateProd)

//Api on the User end
router.post("/createcustomer" , createCustomer)
router.post("/session" , createSession)
router.get("/getsubscription" , getSubscription)
router.post("/cancelsubscription" , cancelSubs)
router.post("/updatesubscription" , updateSubs)
router.post("/invoice" , createInvoice)
router.post("/sendinvoice" , sendInvoice)
router.post("/deleteproduct" , deleteProduct)
router.get("/getsubscriptionlist" , listsubscriptions)






export default router


//price_1OHk0dSHUS8UbeViE93ipdGW