//Disclaimer for smooth api testing & for sending JSON body
// 1) Send User as user_name
// 2) Send Product name as prod_name
// 3) Send User email as email
// 4) Send Product amount as unit_amount
// 5) customer refers to customer.id but for json only cutomer name is passed


import bodyParser from "body-parser";
import CircularJSON from "circular-json";
import Stripe from "stripe";
import dotenv from "dotenv"
import { productDetails, userDetails } from "../db/schema.js";


dotenv.config()
const STRIPE_KEY = 'sk_test_51Nv0dVSHUS8UbeVicJZf3XZJf72DL9Fs3HP1rXnQzHtaXxMKXwWfua2zi8LQjmmboeNJc3odYs7cvT9Q5YIChY5I00Pocly1O1'
//const STRIPE_KEY = process.env.STRIPE_KEY


//create product on stripe and a associated price
//this end point is to be used on the Admin side.
//Create product to be called when the admin logs in and creates the subscription for there CRCL , We dont need to save the name and the Price of the product inside strapi , As it will be saved inside the mongo database
export const createProduct = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { prod_name, unit_amount } = req.body
        const amt = unit_amount * 100
        const price = await stripe.prices.create({
            currency: "inr",
            unit_amount: amt,
            recurring: {
                interval: 'month',
            },
            product_data: {
                name: prod_name,
            },
        });
        const priceId = price.id
        const prodId = price.product
        const myProd = productDetails({
            Name: prod_name,
            Product_Id: prodId,
            price: priceId
        })
        const newProd = myProd.save()
        res.status(200).json(CircularJSON.stringify({ price }))
    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
        console.log(error)
    }
}
//delete the product 

export const deleteProduct = async(req,res)=>{
    const stripe = Stripe(STRIPE_KEY)
    try{
        const {prod_name} = req.body
        const product  = await productDetails.findOne({Name: prod_name})
        const myProd = product.Product_Id
        const deletedProd = await productDetails.deleteOne({Name : prod_name})
        res.status(200).json(CircularJSON.stringify({deleteProduct}))
        console.log(deletedProd)
    }
    catch(error){
        res.status(500).json(CircularJSON.stringify({message: error.message}))
    }
}



//This Api is to be used on the admin side
//Update product api will be triggred when the admin of the CRCL wants to update the or Price of the product , For this name of the product to be updated ie name , new price ie unit_amount will be passed from the admin and it will update both mongo as well as stripe.
export const updateProd = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { prod_name, unit_amount } = req.body
        const product = await productDetails.findOne({ Name: prod_name })
        const { Product_Id } = product
        const newPrice = await stripe.prices.create({
            product: Product_Id,
            currency: "INR",
            unit_amount,
            recurring: {
                interval: 'month',
            }
        });
        const newPrice_Id = newPrice.id
        const new_update = await productDetails.updateOne({ Name: prod_name },
            {
                $set: {
                    price: newPrice_Id
                }
            })
        res.status(200).json(CircularJSON.stringify({ new_update }))
    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
    }
}

//This api is to be used when the user sign's up for a CRCL
//Here the name and email of this api will be passed while the user sign's up for a particular CRCL
//This api will be triggred when the new user joins the CRCL , then the email and name of the new user will be passed from the frontend which will be saved in mongo database and it will be creating a new user on stripe with no payments.
export const createCustomer = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { user_name, email } = req.body
        const customer = await stripe.customers.create({
            name: user_name,
            email,
        });
        const cust_Id = customer.id
        const my_user = new userDetails({
            Name: user_name,
            email: email,
            customer_Id: cust_Id
        })
        const myUser = my_user.save()
        res.status(200).json(CircularJSON.stringify({ myUser }))
    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
        console.log(error)
    }
}


export const createSession = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { prod_name, user_name } = req.body
        const product = await productDetails.findOne({ Name: prod_name })
        const price = product.price
        const user = await userDetails.findOne({ Name: user_name })
        const cust_id = user.customer_Id
        const session = await stripe.checkout.sessions.create({
            customer: cust_id,
            success_url: 'https://example.com/success',
            line_items: [
                {
                    price: price,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
        });
        res.status(200).json(CircularJSON.stringify({ session }))
    }
    catch (error) {
        res.json(CircularJSON.stringify({ error: error.message }))
        console.log(error)
    }
}
//list all the subscription 

export const listsubscriptions = async(req,res)=>{
    const stripe = new Stripe(STRIPE_KEY)
    try{
        const {user_name} = req.body
        const user = await userDetails.findOne({Name: user_name})
        const cust_id = user.customer_Id
        const subscriptions = await stripe.subscriptions.list({
            customer: cust_id,
            limit: 10,
          });
          res.status(200).send(subscriptions)
    }
    catch(error){
        res.status(500).json(CircularJSON.stringify({messgae: error.message}))
    }
}





//sending the invoice 
export const sendInvoice = async (req, res) => {
    const stripe = Stripe(STRIPE_KEY)
    try {
        const {user_name} = req.body
        const user = await userDetails.findOne({ Name: user_name })
        const invoiceId = user.InvoiceId
        const invoice = await stripe.invoices.pay(invoiceId);
        res.json(CircularJSON.stringify({ invoice }))
    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
    }
}

//in_1OHly8SHUS8UbeViETZyKKR5
//in_1OHlxdSHUS8UbeViP8Yi2RHm
//in_1OHlxdSHUS8UbeViP8Yi2RHm

//When after successful payment the customer clicks of done or something then this api to be called
//This api to be triggred on the success page where a button would be avialable , Over which the click will trigger this api as well as this will also take the user to the home page after sucessful payment , here we will have to pass the name of the user from the front end
export const getSubscription = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { user_name } = req.body
        const my_user = await userDetails.findOne({Name: user_name})
        const customerId = my_user.customer_Id
        console.log(customerId)
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 10,
        });
        const subsId = subscriptions.data.map(subscription => subscription.id).join(', ');
        console.log(subsId)
        const updated_user = await userDetails.updateOne({ Name: user_name },
            {
                $set: {
                    subscription_Id: subsId
                },
            })
        res.status(200).send({ updated_user })
        console.log(updated_user)
    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
    }
}

//Cancel Subscription 
// this api will be triggred when the user wants to cancel the subscription , To activate this name of the user will be passed from the ui.
export const cancelSubs = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { user_name } = req.body
        const myuser = await userDetails.findOne({ Name: user_name })
        const subsId = myuser.subscription_Id
        const subscription = await stripe.subscriptions.cancel(
            subsId
        );
        const updated_user = await userDetails.updateOne({ Name: user_name },
            {
                $set: {
                    subscription_Id: null
                },
            })
        res.status(200).json(CircularJSON.stringify({ subscription }))

    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
    }
}


//update subscription
//This api will be triggred when the user updates the subscription to the new product the billing cycle and the invoice will be generated on the next month of the current subscription .
export const updateSubs = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { prod_name, user_name } = req.body
        const product = await productDetails.findOne({ Name: prod_name })
        const price = product.price
        const user = await userDetails.findOne({ Name: user_name })
        const subsId = user.subscription_Id
        console.log(subsId)
        const subscription = await stripe.subscriptions.update(
            subsId,
            {
                metadata: {
                    price,
                },
            }
        );
        const subs_Id = subscription.id
        const updated_user = await userDetails.updateOne({ Name: user_name },
            {
                $set: {
                    subscription_Id: subs_Id
                },
            })
        res.status(200).send(({ subscription }))
    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
    }
}


//stripe invoicing test 
export const createInvoice = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { user_name } = req.body
        const myuser = await userDetails.findOne({ Name: user_name })
        const { customer_Id } = myuser
        const invoice = await stripe.invoices.create({
            customer: customer_Id,
        });
        res.status(200).json(CircularJSON.stringify({ invoice }))
    } catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
    }
};


//Admin Stripe Key Validation 
export const adminKeyValidation = async (req, res) => {
    const { stripeKey } = req.body
    const stripe = new Stripe(stripeKey)
    try {
        const products = await stripe.products.list({
            limit: 1,
        });
        res.status(200).json(CircularJSON.stringify({ products }))
        return products.status
    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
    }
}
