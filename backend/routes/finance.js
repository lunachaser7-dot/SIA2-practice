const express = require("express");
const router = express.Router();

const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, async (req, res) => {

    try {

        const result = await db.query(
            "SELECT * FROM finance ORDER BY id DESC"
        );

        res.json(result.rows);

    } catch (err) {

        console.log(err);
        res.status(500).json(err);

    }

});

router.post("/", verifyToken, async (req, res) => {
    const {
        type,
        category,
        amount,
        description
    } = req.body;

    try {
        await db.query(
            `INSERT INTO finance
            (
                type,
                category,
                amount,
                description,
                transaction_date
            )
            VALUES (?, ?, ?, ?, NOW())`,
            [type, category, amount, description]
        );

        res.json({
            message: "Transaction Added"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Unable to add transaction." });
    }
});

router.put("/:id", verifyToken, async (req, res) => {

    const {
        category,
        amount,
        description
    } = req.body;

    await db.query(
        `
        UPDATE finance
        SET
            category=?,
            amount=?,
            description=?
        WHERE id=?
        `,
        [
            category,
            amount,
            description,
            req.params.id
        ]
    );

    res.json({
        message: "Updated"
    });

});
router.delete("/:id", verifyToken, async (req, res) => {

    await db.query(
        "DELETE FROM finance WHERE id=?",
        [req.params.id]
    );

    res.json({
        message: "Deleted"
    });

});

module.exports = router;