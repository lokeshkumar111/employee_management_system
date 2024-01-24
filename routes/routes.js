// imports
const express = require("express");
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

// image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    },
});

var upload = multer({
    storage: storage,
}).single("image");

// insert a user into the database routes
router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });

    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'User added successfully!'
            };
            res.redirect('/');
        })
        .catch((err) => {
            console.log("error while post the data")
            res.json({ message: err.message, type: 'danger' });
        });
});




router.get("/", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index', {
            title: "Home Page",
            users: users,
        });
    } catch (err) {
        console.error("Error while fetching users:", err);
        res.json({ message: err.message });
    }
});

router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

module.exports = router;
