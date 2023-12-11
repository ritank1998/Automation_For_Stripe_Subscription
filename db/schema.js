import mongoose from "mongoose"


const db1 = mongoose.createConnection("mongodb://127.0.0.1:27017/Stripe_User_Base")
const db2 = mongoose.createConnection("mongodb://127.0.0.1:27017/Stripe_User_Base")


export const productDetails = db1.model("ProductDetails", mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Product_Id: {
        type: String,
        requires: true
    },
    price: {
        type: String,
        required: true
    }
}))

export const userDetails = db2.model("userDetails", mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    customer_Id: {
        type: String,
        require: true
    },
    subscription_Id: {
        type: String
    },
    checkout_session_Id :{
        type: String,
    },
    paymentDate: {
        type: Date,
    },
    paymentStatus: {
        type: String,
    }
}))


