// Fetch data from various APIs and populate respective fields
fetchData();

async function fetchData() {
    const rooms = await fetchRooms();
    populateRooms(rooms);
    
    const subjects = await fetchSubjects();
    populateSubjects(subjects);

    const activities = await fetchActivities();
    populateActivities(activities);

    const roles = await fetchRoles();
    populateRoles(roles);

    const statuses = await fetchStatuses();
    populateStatuses(statuses);

    const users = await fetchUsers();
    populateUsers(users);
}

// Functions to populate UI elements with data
function populateRooms(rooms) {
    const select = document.getElementById('roomSelect');
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.name;
        select.appendChild(option);
    });
}

function populateSubjects(subjects) {
    const select = document.getElementById('subjectSelect');
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        select.appendChild(option);
    });
}

function populateActivities(activities) {
    const select = document.getElementById('activitySelect');
    activities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity.id;
        option.textContent = activity.name;
        select.appendChild(option);
    });
}

function populateRoles(roles) {
    const select = document.getElementById('roleSelect');
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        select.appendChild(option);
    });
}

function populateStatuses(statuses) {
    const select = document.getElementById('statusSelect');
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.id;
        option.textContent = status.name;
        select.appendChild(option);
    });
}

function populateUsers(users) {
    const select = document.getElementById('userSelect');
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName}`;
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
    fetch('http://localhost:3000/getactivities')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched activities:', data);
            displayActivities(data);
        })
        .catch(error => {
            console.error('Error fetching activities:', error);
        });
}

function displayActivities(activities) {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';

    activities.forEach(activity => {
        const li = document.createElement('li');
        li.textContent = `User ${activity.idUser} - ${activity.startTime} - Duration: ${activity.duration} minutes`;
        activityList.appendChild(li);
    });
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

// Helper function to fetch data from API and handle errors
async function fetchDataFromAPI(url) {
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// User registration form submission
const regForm = document.getElementById('registerForm');
// Uncomment to add event listener
// regForm.addEventListener('submit', addUser);

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
    event.preventDefault(); // Prevent form submission

    const activityName = document.getElementById('roomName').value; // Replace roomName with activity name input ID

    try {
        const response = await fetch('/addactivity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: activityName }) // Sending the activity name to the API
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById('roomSuccess').innerText = data.error;
        } else {
            document.getElementById('roomSuccess').innerText = 'Activity added successfully.';
            populateActivityOption(activityName, data.id); // Assuming the API returns the activity id
        }
    } catch (error) {
        document.getElementById('roomSuccess').innerText = 'Error adding activity.';
        console.error('Error:', error);
    }
}

// Function to populate newly added activity to the dropdown list
function populateActivityOption(name, id) {
    const select = document.getElementById('activitySelect');
    const option = document.createElement('option');
    option.value = id;
    option.textContent = name;
    select.appendChild(option);
}

const express = require('express');
const app = express();
const db = require('better-sqlite3')('studietid.db'); // Assuming the SQLite database is named 'studietid.db'

app.use(express.json()); // Middleware to parse JSON request bodies

// Fetch rooms
app.get('/getrooms/', (req, res) => {
    const rooms = db.prepare('SELECT * FROM room').all();
    res.json(rooms);
});

// Fetch subjects
app.get('/getsubjects/', (req, res) => {
    const subjects = db.prepare('SELECT * FROM subjects').all();
    res.json(subjects);
});

// Fetch activities
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
