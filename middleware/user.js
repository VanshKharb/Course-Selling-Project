const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");

function userMiddleware(req, res, next) {
    const token = req.headers.token;

    try {
        const decodedData = jwt.verify(token, JWT_USER_PASSWORD);

        if (decodedData) {
            req.userId = decodedData.id;
            next();
        }
        else {
            return res.status(403).json({
                message: "incorrect creds",
            });
        }
    }
    catch(e) {
        return res.status(403).json({
            message: "incorrect creds",
        });
    }
}

module.exports = {
    userMiddleware,
};