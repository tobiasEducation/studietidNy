const express = require('express');
const path = require('path');
const sqlite3 = require('better-sqlite3');
const fs = require('fs');

const app = express();
global.db = sqlite3('./studietid.db', { verbose: console.log });
const dbPath = path.join(__dirname, 'studietid.db');
console.log('Database path:', dbPath);

if (fs.existsSync(dbPath)) {
    console.log('Database filen eksisterer');
} else {
    console.error('Database filen eksisterer ikke med:', dbPath);
}

const cors = require('cors');
const session = require('express-session'); // Legg til denne linjen
const bcrypt = require('bcrypt'); // Legg til denne linjen

const staticPath = path.join(__dirname, 'public');
app.use(express.urlencoded({ extended: true })); // To parse urlencoded parameters
app.use(express.json()); // To parse JSON bodies
app.use(cors());

// Konfigurere session
app.use(session({
    secret: 'hemmelig_nøkkel',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Setcleaert til true hvis du bruker HTTPS
}));

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
    let sql = global.db.prepare("SELECT COUNT(*) AS count FROM user WHERE email = ?");
    let result = sql.get(email);
    return result.count === 0;
}

// Funksjon for å opprette en ny bruker med hashet passord
async function addUser(firstName, lastName, idRole, isAdmin, email, password) {
    const saltRounds = 10; // Antall salt-runder for hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash passordet

    const sql = global.db.prepare(
        "INSERT INTO user (firstName, lastName, idRole, isAdmin, email, password) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const info = sql.run(firstName, lastName, idRole, isAdmin, email, hashedPassword); // Lagre hashet passord

    const selectSql = global.db.prepare(
        'SELECT user.id as userid, firstname, lastname, role.name as role ' +
        'FROM user INNER JOIN role ON user.idrole = role.id WHERE user.id = ?'
    );
    let rows = selectSql.all(info.lastInsertRowid);
    console.log('row inserted', rows[0]);

    return rows[0];
}

app.post('/adduser', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Validate email format and check if email already exists
    if (!checkValidEmailFormat(email)) {
        return res.json({ error: 'Invalid email format.' });
    } else if (!checkEmailExists(email)) {
        return res.json({ error: 'Email already exists.' });
    } else {
        const newUser = await addUser(firstName, lastName, 2, 0, email, password); // Pass på passordet

        if (!newUser) {
            return res.json({ error: 'Failed to register user.' });
        }

        res.sendFile(path.join(staticPath, 'app.html'));
    }
});

// Get all users
app.get('/getusers', (req, res) => {
    console.log("Fetching users from database...");
    global.db.all("SELECT * FROM user", [], (err, rows) => {
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
    global.db.all("SELECT * FROM subject", [], (err, rows) => {
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
        const userExists = global.db.prepare("SELECT 1 FROM user WHERE id = ?").get(idUser);
        const subjectExists = global.db.prepare("SELECT 1 FROM subject WHERE id = ?").get(idSubject);
        const roomExists = global.db.prepare("SELECT 1 FROM room WHERE id = ?").get(idRoom);
        const statusExists = global.db.prepare("SELECT 1 FROM status WHERE id = ?").get(idStatus);

        if (!userExists || !subjectExists || !roomExists || !statusExists) {
            return res.json({ error: 'Invalid foreign key values. Ensure user, subject, room, and status exist.' });
        }

        const sql = global.db.prepare(
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
    global.db.all("SELECT * FROM activity", [], (err, rows) => {
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
    console.log('Serveren kjører p http://localhost:3000');
});

app.get('/user', (req, res) => {
    res.redirect('/getusers');
});

app.get('/getrooms', (req, res) => {
    console.log("Fetching rooms from database...");
    global.db.all("SELECT * FROM room", [], (err, rows) => {
        if (err) {
            console.error("Error fetching rooms:", err.message);h
            return res.status(500).json({ error: "Error fetching rooms" });
        }
        console.log("Rooms fetched:", rows);
        res.json(rows);
    });
});

// Simulere en database av brukere med hash-verdi for passord
// Legg inn denne hashete passordet for en av brukerne i databasen 
// password: '$2b$10$OaYrsjfSOxIlRl3l6brlTe4erojrTxjgsYSzUNF.uCa9Ny9XMmXoS' 
// Hash av "Passord123"

// Rute for innlogging
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Both email and password are required.');
    }

    try {
        // Fetch the user from the database
        const sql = global.db.prepare("SELECT * FROM user WHERE email = ?");
        const user = sql.get(email);
        console.log('Login attempt for email:', email);

        if (!user) {
            console.error('No user found with that email.');
            return res.status(401).send('Ugyldig e-post eller passord');
        }

        console.log('User fetched from database:', user);

        // Compare the provided password with the hashed password from the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.loggedIn = true;
            req.session.username = user.firstname;  // Assuming user har `firstname`-feltet
            return res.send('Innlogging vellykket!');
        } else {
            console.error('Incorrect password.');
            return res.status(401).send('Ugyldig e-post eller passord');
        }
    } catch (error) {
        console.error('Error during password comparison:', error);
        return res.status(500).send('Intern serverfeil');
    }
});



// Rute for utlogging
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Feil under utlogging');
        }
        res.send('Du er nå logget ut.');
    });
});

// Beskyttet rute som krever at brukeren er innlogget
app.get('/dashboard', (req, res) => {
    if (req.session.loggedIn) {
        res.send(`Velkommen, ${req.session.username}!`);
    } else {
        res.status(403).send('Du må være logget inn for å se denne siden.');
    }
});
