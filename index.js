if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const engine = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");
const Customers = require("./models/customers");
const Transaction = require("./models/transactions");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const dbURL = process.env.DB_URL;
const mongoose = require("mongoose");
const localDbUrl = "mongodb://127.0.0.1:27017/GRIP"
const connection = mongoose.connect(
    localDbUrl,
);

connection
    .then((response) => {
        console.log("Database has been connected!");
    })
    .catch((err) => {
        console.log(err);
    });
const sessionOptions = {
    secret: "shark-win", resave: false, saveUninitialized: false, cookie: {
        httpOnly: true, expires: Date.now() + 1000 * 60 * 60 * 24 * 7, maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

const store = MongoStore.create({
    mongoUrl: localDbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("Some Session store Error Occured!! ", e);
})
app.use(session(sessionOptions))
app.use(flash())
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static((__dirname, "./public")));
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.get("/", (re, res) => {
    res.render("main/home")
})
app.get("/customers", async (req, res) => {
    const customers = await Customers.find({});
    res.render("main/customers", { customers });
})

app.get("/transactions", async (req, res) => {
    const transaction = await Transaction.find({});
    res.render("main/transactionHistory", { transaction });
})

app.get("/customers/:id", async (req, res) => {
    const { id } = req.params;
    const customer = await Customers.findById(id);
    res.render("main/viewCustomer", { customer });
})

app.get("/customers/transfer/:id", async (req, res) => {
    const { id } = req.params;
    const sender = await Customers.findById(id)
    const customers = await Customers.find({});
    res.render("main/transfer", { sender, customers });
})

app.put("/customers/transfer/:id", async (req, res) => {
    const { id } = req.params;
    const { recieverName, amountWithdrawl } = req.body;
    const sender = await Customers.findById(id);
    const reciever = await Customers.findOne({ name: recieverName });
    if (sender.currBalance < amountWithdrawl) {
        req.flash("error", "Transaction Failed: Insufficient Balance");
        res.redirect("/customers");
    }
    else {

        (sender.currBalance) -= parseInt(amountWithdrawl);
        (reciever.currBalance) += parseInt(amountWithdrawl);
        await sender.save();
        await reciever.save();
        const transbody = {
            sender: sender.name, reciever: reciever.name, amount: amountWithdrawl
        }
        const transaction = new Transaction(transbody);
        await transaction.save();
        req.flash("success", "Transaction Successful!")
        res.redirect("/customers");
    }
})

app.listen(3000, () => {
    console.log("Listening On Port 3000");
});