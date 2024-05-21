export const jwt = require('jsonwebtoken');
require("dotenv").config();

export const generateJWT = (data, duration) => {
    // the below code generates a cryptographically strong JWT

    return jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: duration, algorithm: 'HS256' });
}

export const verifyJWT = (token) => {
    try {

        const decrpyt = jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });
        return decrypt; // returns the identity associated with the token
    } catch (error) {
        console.log(error);
        return null; // error if one appears
    }
}
