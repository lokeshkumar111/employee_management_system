// imports
const express = require("express");
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

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

// Edit an User route
router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const user = await User.findById(id).exec();
        if (!user) {
            return res.redirect('/');
        }
        res.render("edit_users", {
            title: "Edit User",
            user: user,
        });
    } catch (err) {
        console.error("Error while fetching user for editing:", err);
        res.json({ message: err.message });
    }
});

// update user route
router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            // Check if the old image file exists before unlinking
            const oldImagePath = "./uploads/" + req.body.old_image;
            if (fs.existsSync(oldImagePath)) {
                try {
                    fs.unlinkSync(oldImagePath);
                } catch (err) {
                    console.log(err);
                }
            } else {
                console.log("Old image file not found:", oldImagePath);
            }
        } else {
            new_image = req.body.old_image;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                image: new_image,
            },
            { new: true } // This option returns the updated document
        ).exec();

        if (updatedUser) {
            req.session.message = {
                type: "success",
                message: "User updated successfully",
            };
            res.redirect("/");
        } else {
            res.json({ message: "User not found", type: 'danger' });
        }
    } catch (err) {
        console.log("Error while updating user:", err);
        res.json({ message: err.message, type: 'danger' });
    }
});

// delete user route
router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const user = await User.findOneAndDelete({ _id: id }).exec();

        if (user && user.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + user.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully',
        };
        res.redirect('/');
    } catch (err) {
        console.log("Error while deleting user:", err);
        res.json({ message: err.message });
    }
});


// get login page 
router.get("/login", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('login', {
            title: "login",
            users: users,
        });
    } catch (err) {
        console.error("Error while fetching users:", err);
        res.json({ message: err.message });
    }
});

// get signup page  
router.get("/signup", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('signup', {
            title: "signup",
            users: users,
        });
    } catch (err) {
        console.error("Error while fetching users:", err);
        res.json({ message: err.message });
    }
});

module.exports = router;
