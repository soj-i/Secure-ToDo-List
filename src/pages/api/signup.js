import { User } from "@/lib/authEntities/user";
import { getDatabase } from "@/lib/db";
import { resolve } from "path";

export default async function handler(req, res) {
    const db = getDatabase();
    try {
        const message = await createAccount(db, req.body);
        res.status(200).json(message);
    } catch (error) {
        res.status(409).json(error);
    }
};

const crypto = require('crypto');

function salter(password){
    return new Promise((resolve,reject) => { //using Promise for asynch reasons. goes through phases ending in either rejected or resolved
        const salt = crypto.randomBytes(16).toString('hex');
    
        crypto.scrypt(password,salt,20,(err, derivedKey) => { //last parameter runs *after* hashing is completed
            if (err){
            reject (err); //if an error appeared when hashing, we reject the promise
            }
            else{
                resolve({salt: salt, newPass: derivedKey.toString('hex')}); //we now store the salt and password 
            }
            
        
        });
    });
   
}
const createAccount = async (db, bodyParams) => {
    return new Promise(async (resolve, reject) => {
        // TODO (exercise 1): Update the code below as needed to strengthen
        // storage of password-credentials

        // You may (and are encouraged to) create your own functions 
        // to modularize your code,
        // and call them in here as needed

        const name = bodyParams.name;
        const email = bodyParams.email;
        const username = bodyParams.username;
        const password = bodyParams.password;
        // console.log("original pass: " + password);
        // console.log("IM RUNNING 0");
        const saltAndPass = await salter(password);


        // console.log("IM RUNNING1");
        // console.log(saltAndPass);
        // console.log("IM RUNNING 2");
        // console.log(saltAndPass);

        const saltStore = saltAndPass.salt;
        const passStore = saltAndPass.newPass;

        // console.log("salt: " + saltStore);
        // console.log("saltedPass: " + passStore);
        let user;
        try {
            user = new User(name, email, username, password);
            console.log("user made");
        } catch (error) {
            console.log("error?");
            return reject(error.message);
        }
        // console.log("IM RUNNING 3");
        const query = `INSERT INTO users (username, email, salt, password, name) VALUES(\'${user.getUsername()}\', \'${user.getEmail()}\', \'${saltStore}', \'${passStore}\', \'${user.getName()}\')`;

        // console.log(query);
        
        // console.log(query);
        
        
        db.query(query, (err, rows, fields) => {
                if (err) {
                    return reject("Username exists");
                } else {
                    return resolve("User created successfully");
                }
            });
        
    });
};