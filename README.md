# Stripe Payment Gateway Integration 
*********
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


`/product`:Creates the product in the Stripe database and stores the product name and product price ID from Stripe in the MongoDb database. This takes the product name and product price from the User Interface.

`/updateprod`: This is triggered when the administrator wants to update the existing product name or the product price. The existing product name is taken from the user interface, which is transferred from the MongoDb database api

   **To be called on the User side**

   
`/createcustomer`: This is triggered when a user logs in. It takes the username and user email automatically on successful login and stores the customerId, email and name from Stripe in the MongoDb database

`/session`: This is triggered when a customer clicks the Buy button on the user interface. This creates a checkout session and retrieves the SessionId, SubscriptionId or PaymentId. This requires the Product_price Id and CustomerId, which are stored in the MongoDb database and are transferred from the user interface.
(To change this to a Single type Payment mode , Change mode to 'payment' in the Api)

`/getsubs`: This is triggered when the payment on the checkout page is successful and the user performs an activity on the redirected page after successful payment. This automatically takes the user_name and fetches paymentID, SessionsId or the SubscriptionId and stores them in the MongoDb database and updates the subscriptionsId or PaymentsId in UserDetails in the MongoDb database.

`/cancel` : This API is triggered when the user clicks on "Cancel subscription" on the user interface. The user name and product priceId are taken from the Mongodb database and the user details in MongoDb are updated with null for subscriptionId or paymentsId.

`/updatesub`: This API is triggered when the user clicks the "update Subscription" button on the UI, and it takes the username and new price ID from the UI and then updates the subscription on Stripe. The updated billing cycle with the difference will start from the end of the month of the existing subscription. The SubscriptionId in the MongoDb database is not updated as the SubscriptionId remains the same after the update.


## Subscription Status Update Automation

`updateSubscriptionStatus()`: (/route/route.js)

### This module automates the process of updating and managing subscription statuses for users leveraging a third-party service, Stripe, for payment management.

## Objective
`The primary goal of this module is to synchronize and maintain the payment status of user subscriptions stored in the local database with the actual status obtained from the Stripe payment gateway.`

## Overview
 1) Data Collection: Retrieves user details from the local database containing subscription information.
 2) Stripe Integration: Utilizes the Stripe API to fetch updated subscription statuses associated with unique subscription IDs.
 3) Database Update: Updates the payment status of users in the local database based on the retrieved status from Stripe.
 4) Maintenance: Removes users from the database whose subscription status is non-active.

### Code Execution

1) Initialization: Initializes required variables and Stripe configuration.
2) Data Retrieval: Fetches user details containing subscription IDs.
3) Subscription Status Update:
        a) Extraction: Identifies unique subscription IDs from user data.
        b) Status Retrieval: Fetches the latest status for each subscription from Stripe.
        c) Database Update: Updates the payment status for each user in the local database.
4) Database Cleanup: Removes users with a non-active payment status from the database.
5) Scheduling: Sets up a recurring task using Cron to execute the process at regular intervals.

### Schedule

`The cron job is scheduled to run every 30 seconds to ensure timely synchronization of subscription statuses Considerations`

    1) Ensure proper configuration of Stripe credentials (STRIPE_KEY).
    2) Regularly monitor and verify the synchronization process and database integrity.

### Dependencies

    1) Node.js
    2) Stripe (stripe-node package)
    3) MongoDB (userDetails collection)

### Usage

`Integrate this module into your Node.js application and configure the necessary Stripe credentials and database connections.`

## Notes
********
    The automated process is designed to commence automatically upon the initiation of the application's Express Server. In the initial state, when the customer's database is devoid of 
    users, and no payments have been transacted via Stripe, resulting in an absence of payment status data, the automation process will consistently yield an error. Additionally, the 
    output arrays, namely "All User Subscriptions" and "New Updated Subscriptions," will remain empty ([]).
    It is imperative to note that this occurrence does not disrupt any server processes. The automation mechanism operates asynchronously, allowing it to function independently of 
    synchronous constraints. Subsequently, it autonomously retrieves customer information and their respective payment statuses from both the Stripe and MongoDB databases. This 
    initialization happens seamlessly without necessitating a restart or any manual intervention.
    The design ensures a robust and resilient automation process, capable of adapting to changes in the system environment, guaranteeing consistent and reliable performance.


       1) Adjust cron scheduling according to specific synchronization requirements.
       2) Review error handling to capture and manage potential issues during the synchronization process
