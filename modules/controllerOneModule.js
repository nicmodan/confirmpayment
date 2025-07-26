const mongoose = require("mongoose")
const adminSchema = new mongoose.Schema({
	"email": String,
	"date": String,
	"password": String
})


adminSchema.set("toJSON", {
	transform: (document, returnedObject) =>{
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
      	delete returnedObject.__v
	}
})
const StudentAdmin = mongoose.model("ecommersBackend", adminSchema)

module.exports = StudentAdmin