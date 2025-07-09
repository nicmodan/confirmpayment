const express = require("express")
const paymentRouter = express.Router()
const paymentModule = require("../modules/controllerOneModule.js")
const { privateKey, strip_ep_sk, stripe_sk_live, stripe_sk_test, email_api_key, email_public_key, google_pass} = require("../utils/config")
const ip = require("ip");
const axios = require('axios');
const logger = require("../utils/logger")

const stripe = require("stripe")(stripe_sk_test);


const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    console.log(Number(items[0].price)*100)
    return Number(items[0].price)*100;
};

paymentRouter.post("/create-payment-intent", async (req, res) => {
    // http://localhost:3001/api/create-payment-intent
    const {items}  = req.body;
    // [{email, "price"}]
    // console.log(req.body)

    try{

        // const username = items[0].username
        // const mainUser = await userModel.findOne({telegramName: username})

        // Create a PaymentIntent with the order amount and currency
        const customer = await stripe.customers.create({
          email: items[0].email,
        });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateOrderAmount(items),
            currency: "usd",
            customer: customer.id,
            payment_method_types: ['card', 'us_bank_account'],
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            // automatic_payment_methods: {
            //     enabled: true,
            // },
        });

        const newhistory = {
            paymentIntentId: paymentIntent.id,
            transactionProcess: "processing",
            transactionType: "deposit",
            amount: Number(items[0].price),
            date: new Date()
        }
        console.log("paymentIntent.client_secret", paymentIntent.client_secret)

        const newUser = new paymentModule(newhistory)
        const newUserRes = await newUser.save()
        // paymentModule
        // console.log(paymentIntent.id)

    // /api/payment/create-payment-intent
        res.send({
            clientSecret: paymentIntent.client_secret,
            ...newhistory
        });
    }catch(e){
        console.log(e)
        return res.status(500).send({error: "invalid username"})
    }

});



module.exports = paymentRouter