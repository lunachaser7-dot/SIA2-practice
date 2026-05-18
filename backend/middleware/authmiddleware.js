const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

    const bearerHeader = req.headers["authorization"];

    if (!bearerHeader) {
        return res.status(403).json({
            message: "Token Required"
        });
    }

    const token = bearerHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret', (err, authData) => {

        if (err) {
            return res.status(403).json({
                message: "Invalid Token"
            });
        }

        req.user = authData;

        next();
    });
}

module.exports = verifyToken;