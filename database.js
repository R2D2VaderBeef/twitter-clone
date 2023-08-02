const mysql = require('mysql2');
const connection = mysql.createConnection(process.env.DATABASE_URL);

module.exports = {
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM users;',
                function(err, results, fields) {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
    },
    addNewUser: (handle, salt, hash) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'INSERT INTO users (handle, salt, hash) VALUES (?, ?, ?);',
                [handle, salt, hash],
                function(err, results, fields) {
                  if (err) reject(err);
                  else resolve("ok");
                }
              );
        })
    },
    getUser: (handle) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'SELECT * FROM users WHERE handle = ?;',
                [handle],
                function(err, results, fields) {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
    },
    setUserBio: (handle, newbio) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'UPDATE users SET bio = ? WHERE handle = ?;',
                [newbio, handle],
                function(err, results, fields) {
                    if (err) reject(err);
                    else resolve("ok");
                }
            );
        });
    },
    saveNewPoop: (handle, poop, timestamp) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'INSERT INTO posts (handle, content, timestamp) VALUES (?, ?, ?)',
                [handle, poop, timestamp],
                function(err, results, fields) {
                    if (err) reject(err);
                    else {
                        connection.execute(
                            `SELECT LAST_INSERT_ID()`,
                            function (err2, results2, fields2) {
                                if (err2) reject(err2);
                                else resolve(results2);
                            }
                        )
                    }
                }
            );
        });
    },
    saveNewPoopWithAction: (handle, poop, timestamp, action, related_id) => {
        return new Promise((resolve, reject) => {
            let reply = false;
            let repost = false;
            if (action == "fartback") reply = true;
            else repost = true;
            connection.execute(
                'INSERT INTO posts (handle, content, timestamp, reply, repost, related_id) VALUES (?, ?, ?, ?, ?, ?)',
                [handle, poop, timestamp, reply, repost, parseInt(related_id)],
                function(err, results, fields) {
                    if (err) reject(err);
                    else {
                        connection.execute(
                            `SELECT LAST_INSERT_ID()`,
                            function (err2, results2, fields2) {
                                if (err2) reject(err2);
                                else resolve(results2);
                            }
                        )
                    }
                }
            );
        });
    },
    getPoop: (id) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'SELECT * FROM posts WHERE id = ?;',
                [id],
                function(err, results, fields) {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
    },
    likePoop: (id, handle) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'SELECT * FROM posts WHERE id = ?;',
                [id],
                function(err, results, fields) {
                    if (err) reject(err);
                    else {
                        let newLikes = results[0].likes ? [...results[0].likes] : [];
                        newLikes.push(handle);
                        let newNum = newLikes.length;
                        connection.execute(
                            'UPDATE posts SET likes = ? WHERE id = ?;',
                            [newLikes, id],
                            function(err, results, fields) {
                                if (err) reject(err);
                                else resolve(newNum);
                            }
                        );
                    }
                }
            );
        });
    },
    getRecentPoops: (number, page) => {
        return new Promise((resolve, reject) => {
            let offset = 0;
            if (page > 1) offset = (page - 1) * number;
            connection.execute(
                'SELECT * FROM posts ORDER BY timestamp DESC LIMIT ? OFFSET ?;',
                [number, offset],
                function(err, results, fields) {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
    }
}