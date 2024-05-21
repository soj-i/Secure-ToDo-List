// ALL API endpoints related to lists

import { getDatabase, closeDBInstance } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

// This function is invoked when the "/api/list" endpoint is requested
export default async function handler(req, res) {
    const username = verifyJWT(req.headers["authorization"]);
    if (username === null) {
        res.status(401).json("Issue with JWT: user must re-authenticate");
        return;
    }

    const db = getDatabase();

    // If POST request, it means a list is being created
    if (req.method == 'POST') {
        try {
            await create(db, req.body, username);
            closeDBInstance(db);
            res.status(200).json("Successfully inserted list");
        } catch (e) {
            closeDBInstance(db);
            res.status(400).json("Error inserting list");
        }

    // If GET request, it means lists are being fetched
    } else if (req.method == 'GET') {
        try {
            const lists = await get(db, username);
            closeDBInstance(db);
            res.status(200).json(lists);
        } catch (e) {
            console.error(e);
            closeDBInstance(db);
            res.status(400).json("Error getting lists");
        }
    }
}

const create = async (db, bodyParams, username) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO lists(listname, username) VALUES(\'${bodyParams.listname}\', \'${username}\');`;
        db.query(query, (err, rows, fields) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            return resolve();
        });
    });
}

const get = async (db, username) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM lists WHERE username = \'${username}\';`;
        db.query(query, (err, rows, fields) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            return resolve(rows);
        });
    });
}