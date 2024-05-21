
import { getDatabase } from "@/lib/db";

const crypto = require('crypto');

const db = getDatabase();

function loginSalter(password, username=undefined) {
    return new Promise((resolve, reject) => {
        if (username === undefined) {
            reject("Username is required for login");
            return;
        }


        // Fetch the salt for the given username from the database
        const q = `SELECT salt FROM users WHERE username = '${username}'`;
        db.query(q, (err, rows) => {
            if (err) {
                reject("Database error");
                return;
            }
            if (rows.length === 0) {
                reject("Username or Password Incorrect");
                return;
            }
            const salt = rows[0].salt;

            // Hash the password with the retrieved salt
            crypto.scrypt(password, salt, 20, (err, derivedKey) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ salt: salt, newPass: derivedKey.toString('hex') });
                }
            });
        });
    });
}

// Check if the username/password pair is in the credential database
export const verifyUserPass = (db, user, pass) => {
    return new Promise(async (resolve, reject) => {
        // This function should check if the username and password entered matches
        // a user in the database and then return the username.

        // If the user is verified: return resolve(<username>);
        // If the user is not verified: return reject(<appropriate error message>);

        // TODO (exercise 3): Replace the code below with the correct implementation

        // plan
        
        // scenarios given user-pass
        // ----------
        // * username dne in db
        // * username exists
        //   1. password doesnt match
        //   2. password does match

        // rejection
        // * username or password is incorrect

        const saltAndPass = await loginSalter(pass, user);

        const salt = saltAndPass.salt;
        const saltedPass = saltAndPass.newPass;

        const numberOfRows = `SELECT * FROM users WHERE username = \'${user}\' AND password = \'${saltedPass}\' AND salt = \'${salt}\' `;

        db.query(numberOfRows, (err,rows,fields) => {
            if (err){
                return reject("Username or Password Incorrect");
            }
            else {
                if (rows.length == 0){
                    reject("Username or Password Incorrect");
                }
                else {
                    console.log("logged into account: " + user);
                    return resolve(user);
                    }
            }
        });
        //username: Sandy
        //pass: aSldErdA4%5$%

        //salt: 1824c5815f98c6133f21a9c52145ee1e
        //salted pass : ecc9e603038c6236ab2b65a72f51137472e4213a

        
    });
}