const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");

function adminMiddleware(req, res, next) {
    const token = req.headers.token;

    try {
        const response = jwt.verify(token, JWT_ADMIN_PASSWORD);

        if (response) {
            req.userId = response.id;
            next();
        }
        else {
            return res.status(403).json({
                message: "Incorrect creds",
            });
        }
    }
    catch(e) {
        return res.status(403).json({
            message: "Incorrect creds",
        });
    }
}

module.exports = {
    adminMiddleware,
};