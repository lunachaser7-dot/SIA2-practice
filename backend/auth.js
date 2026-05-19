const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const db = require("../db");

router.post("/register", async (req, res) => {

    const {
        fullname,
        email,
        password,
        role
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
        `
        INSERT INTO users
        (name,email,password,role)
        VALUES ($1,$2,$3,$4)
        `,
        [fullname, email, hashedPassword, role]
    );

    res.json({
        message: "Registered Successfully"
    });

});

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const result = await db.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );

    if (result.rows.length === 0) {
        return res.status(401).json({
            message: "Invalid Email"
        });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!validPassword) {
        return res.status(401).json({
            message: "Invalid Password"
        });
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET
    );

    res.json({
        token,
        role: user.role
    });
});

module.exports = router;