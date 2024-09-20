const sqlite3 = require('better-sqlite3');
const path = require('path');
const db = sqlite3('./studietid.db', { verbose: console.log });
const express = require('express');
const app = express();

const staticPath = path.join(__dirname, 'public');
app.use(express.urlencoded({ extended: true })); // To parse urlencoded parameters
app.use(express.json()); // To parse JSON bodies

app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'app.html'));
});

function checkValidEmailFormat(email) {
    let parts = email.split('@');

    // Email should have exactly one "@" symbol
    if (parts.length !== 2) {
        return false;
    }

    let localPart = parts[0];
    let domainPart = parts[1];

    if (localPart.length === 0 || domainPart.length === 0) {
        return false;
    }

    if (!domainPart.includes('.')) {
        return false;
    }

    let domainParts = domainPart.split('.');

    if (domainParts.length < 2) {
        return false;
    }

    let domainName = domainParts[0];
    let domainExtension = domainParts[1];

    if (!domainName || !domainExtension) {
        return false;
    }

    if (domainExtension.length < 2) {
        return false;
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return false;
    }

    if (domainName.startsWith('-') || domainName.endsWith('-')) {
        return false;
    }

    return true;
}

function checkEmailExists(email) {
    let sql = db.prepare("select count(*)  as count from user where email = ?");
    let result = sql.get(email);
    console.log("result.count", result);
    if (result.count > 0) {
        console.log("Email already exists");
        return false;
    }
    return true;
}

function checkEmailregex(email) {
    const emailRegex = /^[^\s@\.][^\s@]*@[^\s@]+\.[^\s@]+$/;
    let result = emailRegex.test(email);

    if (!result) {
        return false;
    }
}

app.post('/adduser', (req, res) => {
    const { firstName, lastName, email } = req.body;

    // Validate email format and check if email already exists
    if (!checkValidEmailFormat(email)) {
        return res.json({ error: 'Invalid email format.' });
    } else if (!checkEmailExists(email)) {
        res.redirect('/app.html?errorMsg=EmailExist');
    } else {
        const newUser = addUser(firstName, lastName, 2, 0, email);

        if (!newUser) {
            return res.json({ error: 'Failed to register user.' });
        }

        res.sendFile(path.join(staticPath, 'app.html'));
    }
});

function addUser(firstName, lastName, idRole, isAdmin, email) {
    const sql = db.prepare(
        "INSERT INTO user (firstName, lastName, idRole, isAdmin, email) VALUES (?, ?, ?, ?, ?)"
    );
    const info = sql.run(firstName, lastName, idRole, isAdmin, email);

    const selectSql = db.prepare(
        'SELECT user.id as userid, firstname, lastname, role.name as role ' +
        'FROM user INNER JOIN role ON user.idrole = role.id WHERE user.id = ?'
    );
    let rows = selectSql.all(info.lastInsertRowid);
    console.log('row inserted', rows[0]);

    return rows[0];
}

app.get('/getusers/', (req, res) => {
    console.log('/getusers/');

    const sql = db.prepare(
        'SELECT user.id as userid, firstname, lastname, role.name as role ' +
        'FROM user INNER JOIN role ON user.idrole = role.id'
    );
    let users = sql.all();
    console.log("users.length", users.length);

    res.send(users);
});

// New route to add activity to the database
app.post('/addactivity', (req, res) => {
    const { idUser, startTime, idSubject, idRoom, idStatus, duration } = req.body;

    // Validate input
    if (!idUser || !startTime || !idSubject || !idRoom || !idStatus || !duration) {
        return res.json({ error: 'All fields are required.' });
    }

    try {
        // Foreign key checks for user, subject, room, and status
        const userExists = db.prepare("SELECT 1 FROM user WHERE id = ?").get(idUser);
        const subjectExists = db.prepare("SELECT 1 FROM subject WHERE id = ?").get(idSubject);
        const roomExists = db.prepare("SELECT 1 FROM room WHERE id = ?").get(idRoom);
        const statusExists = db.prepare("SELECT 1 FROM status WHERE id = ?").get(idStatus);

        if (!userExists || !subjectExists || !roomExists || !statusExists) {
            return res.json({ error: 'Invalid foreign key values. Ensure user, subject, room, and status exist.' });
        }

        const sql = db.prepare(
            "INSERT INTO activity (idUser, startTime, idSubject, idRoom, idStatus, duration) VALUES (?, ?, ?, ?, ?, ?)"
        );
        sql.run(idUser, startTime, idSubject, idRoom, idStatus, duration);

        res.json({ message: 'Activity registered successfully!' });
    } catch (err) {
        console.error(err);
        res.json({ error: 'Failed to register activity.' });
    }
});

app.use(express.static(staticPath));
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
