const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String
    },
    currBalance: {
        type: Number
    }

})

module.exports = mongoose.model("Customers", CustomerSchema);
