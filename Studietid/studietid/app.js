const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dbPath = path.join(__dirname, 'studietid.db');
console.log('Database path:', dbPath);

if (fs.existsSync(dbPath)) {
    console.log('Database filen eksisterer');
} else {
    console.error('Database filen eksisterer ikke med:', dbPath);
}

const db = new sqlite3.Database('./studietid.db', (err) => {
    if (err) {
        console.error('Feil ved å åpne databasen:', err.message);
    } else {
        console.log('Koblet til databasen.');
    }
});
const express = require('express');
const app = express();
const cors = require('cors');

const staticPath = path.join(__dirname, 'public');
app.use(express.urlencoded({ extended: true })); // To parse urlencoded parameters
app.use(express.json()); // To parse JSON bodies
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'app.html'));
});

// Improved email validation
function checkValidEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if email already exists in the DB
function checkEmailExists(email) {
    let sql = db.prepare("SELECT COUNT(*) AS count FROM user WHERE email = ?");
    let result = sql.get(email);
    return result.count === 0;
}

app.post('/adduser', (req, res) => {
    const { firstName, lastName, email } = req.body;

    // Validate email format and check if email already exists
    if (!checkValidEmailFormat(email)) {
        return res.json({ error: 'Invalid email format.' });
    } else if (!checkEmailExists(email)) {
        return res.json({ error: 'Email already exists.' });
    } else {
        const newUser = addUser(firstName, lastName, 2, 0, email);

        if (!newUser) {
            return res.json({ error: 'Failed to register user.' });
        }

        res.sendFile(path.join(staticPath, 'app.html'));
    }
});

// Function to insert a new user into the DB
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

// Get all users
app.get('/getusers', (req, res) => {
    console.log("Fetching users from database...");
    db.all("SELECT * FROM user", [], (err, rows) => {
        if (err) {
            console.error("Error fetching users:", err.message);
            return res.status(500).json({ success: false, error: "Error fetching users", details: err.message });
        }
        console.log("Users fetched:", rows);
        res.json({
            success: true,
            users: rows
        });
    });
});

// Get all subjects
app.get('/getsubjects', (req, res) => {
    console.log("Fetching subjects from database...");
    db.all("SELECT * FROM subject", [], (err, rows) => {
        if (err) {
            console.error("Error fetching subjects:", err.message);
            return res.status(500).json({ error: "Error fetching subjects" });
        }
        console.log("Subjects fetched:", rows);
        res.json(rows);  // Directly send the array of subjects
    });
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

// Serve static files
app.use(express.static(staticPath));

// GET route for activities
app.get('/getactivities', (req, res) => {
    console.log("Fetching activities from database...");
    db.all("SELECT * FROM activity", [], (err, rows) => {
        if (err) {
            console.error("Error fetching activities:", err.message);
            return res.status(500).json({ success: false, error: "Error fetching activities", details: err.message });
        }
        console.log("Activities fetched:", rows);
        res.json({
            success: true,
            activities: rows
        });
    });
});

app.listen(3000, () => {
    console.log('Serveren kjører på http://localhost:3000');
});

app.get('/user', (req, res) => {
    // This will redirect /user to /getusers
    res.redirect('/getusers');
});

app.get('/getrooms', (req, res) => {
    console.log("Fetching rooms from database...");
    db.all("SELECT * FROM room", [], (err, rows) => {
        if (err) {
            console.error("Error fetching rooms:", err.message);h
            return res.status(500).json({ error: "Error fetching rooms" });
        }
        console.log("Rooms fetched:", rows);
        res.json(rows);
    });
});


