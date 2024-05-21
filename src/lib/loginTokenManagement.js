// Database management functions
export const storeUniqueValue = (db, uniqueValue, username) => {

    // Update entry in the database (replace old row if row with username already exists)
    return new Promise((resolve, reject) => {
        const query = `REPLACE INTO login (username, unique_value) values(\'${username}\', \'${uniqueValue}\')`;
        db.query(query,
            (err, rows, fields) => {
                return resolve(true);
            });
    });
}

export const searchUniqueValue = (db, uniqueValue) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT username FROM login WHERE unique_value = \'${uniqueValue}\'`;
        db.query(query,
            (err, rows, fields) => {
                if (rows.length > 0) {
                    return resolve(rows[0].username);
                } else {
                    return resolve(null);
                }
            });
    });
};

export const removeUniqueValue = (db, uniqueValue) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM login WHERE unique_value = \'${uniqueValue}\'`;
        db.query(query,
            (err, rows, fields) => {
                return resolve(true);
            });
    });
};