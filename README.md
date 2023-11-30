                                   Stripe Payment Gateway Integration 
## Installation 

1) Clone the Project , Then run npm install to download the dependencies .
2) Install the MongoDb Database and Mongo Compass on the System . 
from `https://www.mongodb.com/docs/manual/installation/`
3) Change the database name and adress to the database on the `connections/conn.js`.
4) create your Stripe account , Generate the Private Api keys and pass it to `.env` as STRIPE_KEY.
5) Rename the Database name on MongoDb on `db/schema.js`.
6) To edit any entry inside the databse collections edit the schema on `db/schema.js`


## Disclaimer for Seamless API testing
1) Send User as user_name
2) Send Product name as prod_name
3) Send User email as email
4) Send Product amount as unit_amount
                      
## Api Endpoints 

`(route/routes.js)`
(These Apis are only active for the Subscription Mode of Payments)

   **To be called on the Admin side**


`/product:Creates the product in the Stripe database and stores the product name and product price ID from Stripe in the MongoDb database. This takes the product name and product price from the User Interface`.

`/updateprod: This is triggered when the administrator wants to update the existing product name or the product price. The existing product name is taken from the user interface, which is transferred from the MongoDb database api`

   **To be called on the User side**

   
`/createcustomer: This is triggered when a user logs in. It takes the username and user email automatically on successful login and stores the customerId, email and name from Stripe in the MongoDb database`

`/session: This is triggered when a customer clicks the Buy button on the user interface. This creates a checkout session and retrieves the SessionId, SubscriptionId or PaymentId. This requires the Product_price Id and CustomerId, which are stored in the MongoDb database and are transferred from the user interface.`
(To change this to a Single type Payment mode , Change mode to 'payment' in the Api)

`/getsubs: This is triggered when the payment on the checkout page is successful and the user performs an activity on the redirected page after successful payment. This automatically takes the user_name and fetches paymentID, SessionsId or the SubscriptionId and stores them in the MongoDb database and updates the subscriptionsId or PaymentsId in UserDetails in the MongoDb database`.

`/cancel : This API is triggered when the user clicks on "Cancel subscription" on the user interface. The user name and product priceId are taken from the Mongodb database and the user details in MongoDb are updated with null for subscriptionId or paymentsId`.

`/updatesub: This API is triggered when the user clicks the "update Subscription" button on the UI, and it takes the username and new price ID from the UI and then updates the subscription on Stripe. The updated billing cycle with the difference will start from the end of the month of the existing subscription. The SubscriptionId in the MongoDb database is not updated as the SubscriptionId remains the same after the update.`
