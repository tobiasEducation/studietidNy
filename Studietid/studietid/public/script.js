// Fetch data from various APIs and populate respective fields
fetchData();

async function fetchData() {
    const rooms = await fetchRooms();
    populateOptions('roomSelect', rooms);
    
    const subjects = await fetchSubjects();
    populateOptions('subjectSelect', subjects);

    const activities = await fetchActivities();
    populateOptions('activitySelect', activities);

    const roles = await fetchRoles();
    populateOptions('roleSelect', roles);

    const statuses = await fetchStatuses();
    populateOptions('statusSelect', statuses);

    const users = await fetchUsers();
    populateOptions('userSelect', users);
}

// Generic function to populate UI elements with data
function populateOptions(selectId, items) {
    const select = document.getElementById(selectId);
    select.innerHTML = ''; // Clear existing options
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name || `${item.firstName} ${item.lastName}`; // Handle users
        select.appendChild(option);
    });
}

// API Fetch functions for each endpoint
async function fetchRooms() {
    return await fetchDataFromAPI('/getrooms/');
}

async function fetchSubjects() {
    return await fetchDataFromAPI('/getsubjects/');
}

async function fetchActivities() {
    return await fetchDataFromAPI('/getactivities'); 
}

async function fetchRoles() {
    return await fetchDataFromAPI('/getroles/');
}

async function fetchStatuses() {
    return await fetchDataFromAPI('/getstatuses/');
}

async function fetchUsers() {
    return await fetchDataFromAPI('/getusers/');
}

async function fetchDataFromAPI(url) {
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Return empty array on error
    }
}

const regForm = document.getElementById('registerForm');


async function addUser(event) {
    event.preventDefault();

    const user = {
        firstName: regForm.firstName.value,
        lastName: regForm.lastName.value,
        idRole: regForm.roleSelect.value,
        isAdmin: 0,
        email: regForm.email.value
    };

    try {
        const response = await fetch('/adduser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById('error').innerText = data.error;
            document.getElementById('success').innerText = '';
        } else {
            document.getElementById('error').innerText = '';
            document.getElementById('success').innerText = 'User registered successfully.';
        }
    } catch (error) {
        document.getElementById('error').innerText = 'An error occurred. Please try again.';
        console.error('Error:', error);
    }
}

// Adding activity functionality
document.getElementById('roomForm').addEventListener('submit', addActivity);

async function addActivity(event) {
    event.preventDefault(); // koding koding koding koding koding koding koding koding koding

    const activityName = document.getElementById('roomName').value; 

    try {
        const response = await fetch('/addactivity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: activityName }) 
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById('roomSuccess').innerText = data.error;
        } else {
            document.getElementById('roomSuccess').innerText = 'Activity added successfully.';
            populateActivityOption(activityName, data.id); 
        }
    } catch (error) {
        document.getElementById('roomSuccess').innerText = 'Error adding activity.';
        console.error('Error:', error);
    }
}

function populateActivityOption(name, id) {
    const select = document.getElementById('activitySelect');
    const option = document.createElement('option');
    option.value = id;
    option.textContent = name;
    select.appendChild(option);
}

const express = require('express');
const app = express();
const db = require('better-sqlite3')('studietid.db'); 

app.use(express.json()); 

app.get('/getrooms/', (req, res) => {
    const rooms = db.prepare('SELECT * FROM room').all();
    res.json(rooms);
});

app.get('/getsubjects/', (req, res) => {
    const subjects = db.prepare('SELECT * FROM subjects').all();
    res.json(subjects);
});

app.get('/getactivities', (req, res) => {
    const query = 'SELECT * FROM activity';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching activities:', err);
            res.status(500).json({ error: 'Error fetching activities' });
            return;
        }
        res.json(results);
    });
});

// Fetch roles
app.get('/getroles/', (req, res) => {
    const roles = db.prepare('SELECT * FROM role').all();
    res.json(roles);
});

// Fetch statuses
app.get('/getstatuses/', (req, res) => {
    const statuses = db.prepare('SELECT * FROM status').all();
    res.json(statuses);
});

// Fetch users
app.get('/getusers/', (req, res) => {
    const users = db.prepare('SELECT * FROM user').all();
    res.json(users);
});

// Add a new activity
app.post('/addactivity', (req, res) => {
    const { name } = req.body;

    try {
        const stmt = db.prepare('INSERT INTO activity (name) VALUES (?)');
        const result = stmt.run(name);
        res.json({ id: result.lastInsertRowid, success: true });
    } catch (error) {
        res.json({ error: 'Failed to add activity' });
    }
});

// Add a new user
app.post('/adduser', (req, res) => {
    const { firstName, lastName, idRole, isAdmin, email } = req.body;
    
    try {
        const stmt = db.prepare('INSERT INTO user (firstName, lastName, idRole, isAdmin, email) VALUES (?, ?, ?, ?, ?)');
        stmt.run(firstName, lastName, idRole, isAdmin, email);
        res.json({ success: true });
    } catch (error) {
        res.json({ error: 'Failed to add user' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
