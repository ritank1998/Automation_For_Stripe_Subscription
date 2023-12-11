//Disclaimer for smooth api testing & for sending JSON body
// 1) Send User as user_name
// 2) Send Product name as prod_name
// 3) Send User email as email
// 4) Send Product amount as unit_amount
// 5) customer refers to customer.id but for json only cutomer name is passed


import bodyParser from "body-parser";
import CircularJSON from "circular-json"
import Stripe from "stripe";
import dotenv from "dotenv"
import cron from 'node-cron'
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
        const { name,  description } = req.body
        console.log(description)
        const amt =  description * 100
        console.log(amt)
        console.log(name)
        const price = await stripe.prices.create({
            currency: "inr",
            unit_amount: amt,
            recurring: {
                interval: 'month',
            },
            product_data: {
                name,
            },
        });
        const priceId = price.id
        const prodId = price.product
        const myProd = productDetails({
            Name: name,
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
    try{
        const { name } = req.body
       const myProd = await productDetails.findOne({Name: name})
       console.log(name)
       const deleteProd  = await productDetails.deleteOne({Name: name})
       res.status(200).json(CircularJSON.stringify({deleteProd}))
    }
    catch(error){
        res.status(500).json(CircularJSON.stringify({message: error.message}))
        console.log(error)
    }
}



//This Api is to be used on the admin side
//Update product api will be triggred when the admin of the CRCL wants to update the or Price of the product , For this name of the product to be updated ie name , new price ie unit_amount will be passed from the admin and it will update both mongo as well as stripe.
export const updateProd = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { name, description } = req.body
        console.log(name , description)
        const product = await productDetails.findOne({ Name: name })
        const { Product_Id } = product
        const newPrice = await stripe.prices.create({
            product: Product_Id,
            currency: "INR",
            unit_amount: description,
            recurring: {
                interval: 'month',
            }
        });
        const newPrice_Id = newPrice.id
        const new_update = await productDetails.updateOne({ Name: name },
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
    const { prod_name, email } = req.body
    try {
        
       const product = await productDetails.findOne({ Name: prod_name })
       console.log("new product is : ", prod_name)
       const price = product.price
       console.log("Product price is :" , price)
       const user = await userDetails.findOne({ email: email })
       console.log("The email is :" , email)
       const cust_id = user.customer_Id
        const session = await stripe.checkout.sessions.create({
            customer: cust_id,
            success_url: 'http://localhost:3000/success',
            line_items: [
                {
                    price: price,
                    quantity: 1,
                }
            ],
            mode: 'subscription',
        });
        const sessionId = session.id
        console.log(sessionId)
        const updated_user = await userDetails.updateOne({email: email} ,{
           $set: {
               checkout_session_Id: sessionId
            }
        } )
        res.status(200).json(CircularJSON.stringify({session}))
        console.log(updated_user)
    }
    catch (error) {
        res.json(CircularJSON.stringify({ error: error.message }))
        console.log(error)
    }
}

//When after successful payment the customer clicks of done or something then this api to be called
//This api to be triggred on the success page where a button would be avialable , Over which the click will trigger this api as well as this will also take the user to the home page after sucessful payment , here we will have to pass the name of the user from the front end
export const getSubscription = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { email } = req.body
        const my_user = await userDetails.findOne({email: email})
        const customerId = my_user.customer_Id
        console.log(customerId)
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1,
        });
        const subsId = subscriptions.data.map(subscription => subscription.id).join(', ');
        const updated_user = await userDetails.updateOne({ email : email },
            {
                $set: {
                    subscription_Id: subsId
                },
            })
            const substatus = subscriptions.data.map(subscription => subscription.status).join(', ');
            const newUpdatedUser = await userDetails.updateOne({email: email},
                {
                    $set: {
                        paymentStatus: substatus
                    }
                })
            
        res.status(200).send({ updated_user })
        console.log(updated_user)
    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
    }
}


//update subscription
export const updateSubscription = async(req,res)=>{
    const stripe = new Stripe(STRIPE_KEY)
    try{
        const {email , prod_name} = req.body
        console.log("email is: " , email)
        console.log("product name is :" , prod_name)
        const reqProd =await productDetails.findOne({Name: prod_name})
        const reqProd_Id = reqProd.price
        console.log(reqProd_Id)
        const reqUser =await userDetails.findOne({email: email})
        const reqUser_Id = reqUser.subscription_Id
        console.log(reqUser_Id)
        const subscription = await stripe.subscriptions.update(
            reqUser_Id,
            {
              metadata: {
                price: reqProd_Id,
              },
            }
          );
          res.status(200).json(CircularJSON.stringify({subscription}))
    }
    catch(error){
        res.json(CircularJSON.stringify({error: error.message}))
    }
}


//Cancel Subscription 
// this api will be triggred when the user wants to cancel the subscription , To activate this name of the user will be passed from the ui.
export const cancelSubs = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
        const { email } = req.body
        const myuser = await userDetails.findOne({ email: email })
        const subsId = myuser.subscription_Id
        const subscription = await stripe.subscriptions.cancel(
            subsId
        );
        console.log("this is:-" , subscription.id)
        const updated_user = await userDetails.deleteOne({ email: email })

        res.status(200).json(CircularJSON.stringify({ subscription }))

    }
    catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }))
    }
}

//new approach for payment including the update subscription

    


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
    const { stripeKey } = req.params;  // Retrieve the Stripe key from request parameters
    const stripe = new Stripe(stripeKey);

    try {
        const products = await stripe.products.list({
            limit: 1,
        });

        res.status(200).json(CircularJSON.stringify({ products }));
        return products.status;
    } catch (error) {
        res.status(500).json(CircularJSON.stringify({ error: error.message }));
    }
};



//subscription status retrival 
export const subscriptionStatus = async(req,res)=>{
    const stripe = new Stripe(STRIPE_KEY)
    try{
        const {email} = req.body
        const myUser = await userDetails.findOne({email: email})
        const subscriptionId = myUser.subscription_Id
        console.log(subscriptionId)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const newStatus= subscription.status
        const updated_user = await userDetails.updateOne({ email : email },
            {
                $set: {
                    paymentStatus: newStatus
                },
            })
         
        console.log(updated_user)
        res.status(200).json(CircularJSON.stringify({subscription}))
    }
    catch(error){
        res.status(500).json(CircularJSON.stringify({error: error.message}))
    }
}




export const retrieveInvoice = async (req, res) => {
    const stripe = new Stripe(STRIPE_KEY);
  
    try {
        const {email} = req.body
        const myCustomer = await userDetails.findOne({email: email})
        const cusId = myCustomer.customer_Id
        console.log(cusId)
        const paymentMethod = await stripe.customers.invoices(
             cusId,
          );
          res.status(200).json(CircularJSON.stringify({paymentMethod}))
    } catch (error) {
      res.status(500).json(CircularJSON.stringify({ error: error.message }));
      console.log(error);
    }
  };

//<!------------------------------------Case Sensitive Code "Dont touch or this will crash" Logic used here took all my brain cells to sort out the changing status of payment intent everytime this runs as the convetional method of subscription is not followed ---------------------!>//

//node-cron
//declaring the empty arrays to store the values stored inside the mongodb database and values inside the stripe database
let allUserSubscriptions = [];
let newUpdatedSubscription = [];

const updateSubscriptionStatus = async () => {
    const stripe = new Stripe(STRIPE_KEY)
    try {
      const myallData = await userDetails.find({});
  
      // Extract unique subscription IDs from user details
      const subscriptionIdsSet = new Set(myallData.map(user => user.subscription_Id));
      const subscriptionIds = [...subscriptionIdsSet];
  
      // Update allUserSubscriptions array with unique subscription IDs
      const allUserSubscriptions = [...subscriptionIds];
      console.log('All User Subscriptions:', allUserSubscriptions);
  
      const newUpdatedSubscription = [];
  
      // Retrieve updated subscription status for each unique subscription ID
      for (let i = 0; i < allUserSubscriptions.length; i++) {
        const subscriptionId = allUserSubscriptions[i];
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const newStatus = subscription.status;
        newUpdatedSubscription.push({ subscriptionId, newStatus });
  
        // Update the user's payment status in the database
        await userDetails.updateOne(
          { subscription_Id: subscriptionId },
          {
            $set: {
              paymentStatus: newStatus,
            },
          }
        );
      }
  
      // Delete users with a non-active status
      for (let i = 0; i < allUserSubscriptions.length; i++) {
        const subsId = allUserSubscriptions[i];
        const requiredUser = await userDetails.findOne({ subscription_Id: subsId });
        const status = requiredUser.paymentStatus;
  
        if (status !== 'active') {
          // Use direct filter condition in deleteOne
          const deleteResult = await userDetails.deleteOne({ subscription_Id: subsId });
        }
      }
  
      console.log('New Updated Subscriptions:', newUpdatedSubscription);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  // Schedule the cron job to run every 30 seconds
  cron.schedule('*/30 * * * * *', () => {
    console.log('Running cron job...');
    updateSubscriptionStatus();
  });