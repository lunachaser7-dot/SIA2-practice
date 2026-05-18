const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/monthly", async (req, res) => {

    // MySQL uses MONTH() rather than EXTRACT(... FROM ...)
    const result = await db.query(`
        SELECT
            MONTH(transaction_date) AS month,
            SUM(amount) AS total
        FROM finance
        GROUP BY month
        ORDER BY month
    `);

    res.json(result.rows);

});

module.exports = router;