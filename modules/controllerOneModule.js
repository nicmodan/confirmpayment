const mongoose = require("mongoose")
const adminSchema = new mongoose.Schema({
	"email": String,
	"paymentIntentId": String,
	"transactionProcess": String,
    "transactionType": String,
	"paymentID": String,
	"date": String,
	"amount": String
})


adminSchema.set("toJSON", {
	transform: (document, returnedObject) =>{
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
      	delete returnedObject.__v
	}
})
const StudentAdmin = mongoose.model("paymentAdmin", adminSchema)

module.exports = StudentAdmin