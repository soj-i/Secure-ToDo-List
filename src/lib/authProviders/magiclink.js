import { sendEmail } from '../utility';
import { storeUniqueValue, removeUniqueValue } from '/home/todo-list/src/lib/loginTokenManagement';

const crypto = require('crypto');

const getUserFromID = (db, ID) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT username FROM users WHERE email = \'${ID}\'`;
        db.query(query,
            (err, rows, fields) => {
                if (rows.length > 0) 
                    return resolve(rows[0].username); 
                else
                    return reject(`Email address is not registered.`);
            });
    });
};

// This function is invoked when the user tries to login with magic link and supplies an email
export const sendMagicLink = async (hostname, db, email) => {
    // Verify that user trying to login is actually registered, retrieve username if so
    const username = await getUserFromID(db, email);
    // If email is invalid, error is thrown to login API

    // Generate a magic link by generating a magic link
    const magicLink = await generateMagicLink(db, hostname, username);

    // Send the email to the user
    sendEmail(email, 
        "Your TODO list magic link",
        `<a href="${magicLink}">Click here to login to your TODO list.</a><br><br>This link will expire in 15 minutes.`);

    // Once the user clicks on their magic link, the "/login" API is hit once again
};

const generateMagicLink = async (db, hostname, username) => {
    // TODO (exercise 5): Update the magicToken below to generate a "strong" magic token

    const magicToken = crypto.randomBytes(16).toString('hex');
    const magicLink = `${hostname}/login/magiclink?magic_token=${magicToken}`;

    // Store the magic token in the database with a 15-minute expiry
    await storeUniqueValue(db, magicToken, username);

    return magicLink;

};

export const verifyMagicLink = async (db, magicToken) => {
    // TODO (exercise 6): Update the below code to verify the magicToken passed in through a magic link
    // and return the user associated with the magic link
    // const username = "patrick";

    // const query = `SELECT username FROM magic_tokens WHERE token = '${magicToken}' AND expiry > NOW()`;
    // const result = await db.query(query);

    // If needed you may update how to check for an error but 
    // do not change the throwing of the error message
    // if (username === null) throw new Error("Unsuccessful login with magic link");
    // return username;

    const username = await searchUniqueValue(db, magicToken);


    // if we cannot find the token, or it expired, here's an error
    if (username === null || username === undefined) {
        throw new Error("Unsuccessful login with magic link");
    }

    await removeUniqueValue(db, magicToken);

    return username;

    
};