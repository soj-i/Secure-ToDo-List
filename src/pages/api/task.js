// ALL API endpoints related to tasks

import { getDatabase, closeDBInstance } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

// This function is invoked when the "/api/task" endpoint is requested
export default async function handler(req, res) {
    const username = verifyJWT(req.headers["authorization"]);
    if (username === null) {
        res.status(401).json("Issue with JWT: user must re-authenticate");
        return;
    }

    const db = getDatabase();

    // If POST request, it means a task is being created
    if (req.method == "POST") {
        try {
            await create(db, req.body);
            closeDBInstance(db);
            res.status(200).json("Successfully inserted task");
        } catch (e) {
            closeDBInstance(db);
            res.status(400).json("Error inserting task");
        }

    // If GET request, it could mean one of two things
    } else if (req.method == "GET") {

        // If two query paramters are passed in, 
        // it means a task is being completed or un-completed
        if (req.query.task_id && req.query.completed) {
            try {
                await complete(db, req.query);
                closeDBInstance(db);
                res.status(200).json("Completed");
            } catch (e) {
                console.error(e);
                closeDBInstance(db);
                res.status(400).json("Could not complete task");
            }

        // Otherwise, it means all the tasks for a list ID are being fetched
        } else {
            try {
                const tasks = await get(db, req.query);
                closeDBInstance(db);
                res.status(200).json(tasks);
            } catch (e) {
                console.error(e);
                closeDBInstance(db);
                res.status(400).json("Error getting task");
            }
        }
    }
}

const create = async (db, bodyParams) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO tasks(taskname, list_id, completed, priority, deadline) VALUES(\"${bodyParams.taskname}\", \"${bodyParams.list_id}\", 0, \"${bodyParams.priority}\", \"${bodyParams.deadline}\");`;
        db.query(query, (err, rows, fields) => {
            if (err) {
                console.error("Error inserting task");
                return reject(err);
            }
            return resolve();
        });
    });
}

const get = async (db, queryParams) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM tasks WHERE list_id = \"${queryParams.list_id}\";`;
        db.query(query, (err, rows, fields) => {
            if (err) {
                console.error("Error getting tasks");
                return reject(err);
            }
            return resolve(rows);
        });
    });
}

const complete = (db, queryParams) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE tasks SET completed = ${queryParams.completed} WHERE task_id = ${queryParams.task_id};`;
        db.query(query, (err, rows, fields) => {
            if (err) {
                console.error("Error completing task");
                return reject(err);
            }
            return resolve();
        });
    });
}