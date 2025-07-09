require("dotenv").config()

const port = process.env.PORT
const mongoURL = process.env.MONGODB_URL
const privateKey = process.env.PRIVATE_KEY
const stripe_sk_test = process.env.STRIPE_SK_TEST
const stripe_sk_live = process.env.STRIPE_SK_LIVE
const mongodbEirlyUrl = process.env.MONGODB_EIRLY_URL

const email_api_key = process.env.EMAIL_API_KEY
const email_private_key = process.env.EMAIL_PRIVATE_KEY

const strip_ep_sk = process.env.STRIPE_EP_SK
const google_pass = process.env.GOOGLE_PASS


module.exports = {
	port,
	mongoURL,
	strip_ep_sk, 
	stripe_sk_live, 
	stripe_sk_test, 
	email_api_key, 
	google_pass
}