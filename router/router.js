import express from "express"
import {subscriptionStatus,retrieveInvoice,deleteProduct,createInvoice,adminKeyValidation,cancelSubs,createCustomer,getSubscription, createProduct , updateProd , createSession , updateSubscription } from "../route/route.js"
const router = express.Router()

//Admin Key Validation
router.get("/validate" , adminKeyValidation )


//Endpoint on Admin Side
router.post("/product" , createProduct)
router.put("/updateproduct" , updateProd)

//Api on the User end
router.post("/createcustomer" , createCustomer)
router.post("/session" , createSession)
router.post("/getsubscription" , getSubscription)
router.post("/cancelsubscription" , cancelSubs)
router.post("/updatesubscription" , updateSubscription)
router.post("/invoice" , createInvoice)
router.delete("/deleteproduct" , deleteProduct)
router.post("/getinvoice" , retrieveInvoice)
router.post("/status" , subscriptionStatus)









export default router


//price_1OHk0dSHUS8UbeViE93ipdGW