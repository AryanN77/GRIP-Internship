const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    sender: {
        type: String,
    },
    reciever: {
        type: String,
    },
    amount: {
        type: Number,
    }
})

module.exports = mongoose.model("Transactions", TransactionSchema);