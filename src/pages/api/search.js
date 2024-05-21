// ALL API endpoints related to searching within tasks

import { getDatabase, closeDBInstance } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

// This function is invoked when the "/api/search" endpoint is requested
export default async function handler(req, res) {
    const username = verifyJWT(req.headers["authorization"]);
    if (username === null) {
        res.status(401).json("Issue with JWT: user must re-authenticate");
        return;
    }

    const db = getDatabase();

    try {
        const tasks = await search(db, req.query);
        closeDBInstance(db);
        res.status(200).json(tasks);
    } catch (e) {
        console.error(e);
        closeDBInstance(db);
        res.status(400).json(e.message);
    }
};

const getListsForUser = async (db, userId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT list_id FROM lists WHERE user_id = ${userId}`;
        db.query(query, (err, rows, fields) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            return resolve(rows.map(r => r.list_id));
        });
    });
}

const listIdsToSQLFormat = (listIds) => {
    const listIdsString = listIds.join(', ');
    return `( ${listIdsString} )`;
}

const searchInLists = async (db, listIds, searchQuery) => {
    const listIdsString = listIdsToSQLFormat(listIds);
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM tasks WHERE list_id IN ${listIdsString} AND taskname LIKE \'%${searchQuery}%\';`;
        db.query(query, (err, rows, fields) => {
            return resolve(rows);
        });
    });
}

const search = async (db, queryParams) => {
    const searchQuery = queryParams.search_query;
    if (searchQuery == '') { // Nothing to search for
        return [];
    }

    const listIds = await getListsForUser(db, queryParams.user_id);
    if (listIds.length > 0) {
        const tasks = await searchInLists(db, listIds, searchQuery);
        return tasks; 
    } else {
        return [];
    }
};