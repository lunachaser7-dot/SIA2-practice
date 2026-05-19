const express = require("express");
const router = express.Router();

const db = require("../db");
// ❌ REMOVED verifyToken — we don't use tokens
// const verifyToken = require("../middleware/authMiddleware");

// ✅ Get all transactions
router.get("/", async (req, res) => {
    try {
        // ✅ Use `transactions` table (change to `finance` only if that's your real table name)
        const [result] = await db.execute(
            "SELECT * FROM transactions ORDER BY id DESC"
        );
        res.json(result);

    } catch (err) {
        console.error("Error fetching:", err);
        res.status(500).json({ message: "Error fetching data", error: err.message });
    }
});

// ✅ ADD NEW TRANSACTION — FIXED
router.post("/", async (req, res) => {
    const { type, category, amount, description } = req.body;

    // ✅ Basic validation
    if (!type || !category || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid data: check all fields" });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO transactions 
             (type, category, amount, description, transaction_date)
             VALUES (?, ?, ?, ?, NOW())`,
            [type, category, amount, description]
        );

        res.json({
            message: "Transaction Added Successfully",
            id: result.insertId
        });

    } catch (err) {
        console.error("Insert Error:", err);
        res.status(500).json({ message: "Unable to add transaction: " + err.message });
    }
});

// ✅ UPDATE TRANSACTION
router.put("/:id", async (req, res) => {
    const { category, amount, description } = req.body;

    try {
        await db.execute(
            `UPDATE transactions
             SET category=?, amount=?, description=?
             WHERE id=?`,
            [category, amount, description, req.params.id]
        );

        res.json({ message: "Updated Successfully" });

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Update failed" });
    }
});

// ✅ DELETE TRANSACTION
router.delete("/:id", async (req, res) => {
    try {
        await db.execute(
            "DELETE FROM transactions WHERE id=?",
            [req.params.id]
        );

        res.json({ message: "Deleted Successfully" });

    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: "Delete failed" });
    }
});

module.exports = router;

// ❌ DELETE THE EXTRA app.post YOU ADDED AT THE BOTTOM — it causes conflict