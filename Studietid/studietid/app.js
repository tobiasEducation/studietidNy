const sqlite3 = require('better-sqlite3')
const path = require('path')
const db = sqlite3('./studietid.db', {verbose: console.log})
const express = require('express')
const app = express()

const staticPath = path.join(__dirname, 'public')
app.use(express.urlencoded({ extended: true })) // To parse urlencoded parameters
app.use(express.json()); // To parse JSON bodies


app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'app.html'))
})


function checkValidEmailFormat(email) {

    // Step 1: Split the email into two parts: local part and domain part
    let parts = email.split('@');

    // Email should have exactly one "@" symbol
    if (parts.length !== 2) {
        return false;
    }

    let localPart = parts[0];
    let domainPart = parts[1];

    // Step 2: Ensure neither the local part nor the domain part is empty
    if (localPart.length === 0 || domainPart.length === 0) {
        return false;
    }

    // Step 3: Check if domain part contains a "."
    if (!domainPart.includes('.')) {
        return false;
    }

    // Step 4: Split the domain into name and extension
    let domainParts = domainPart.split('.');

    // Ensure there is both a domain name and an extension
    if (domainParts.length < 2) {
        return false;
    }

    let domainName = domainParts[0];
    let domainExtension = domainParts[1];

    // Step 5: Validate that both the domain name and extension are non-empty
    if (!domainName || !domainExtension) {
        return false;
    }

    // Step 6: Ensure domain extension is at least 2 characters long (e.g., ".com")
    if (domainExtension.length < 2) {
        return false;
    }

    // Step 7: Additional checks (optional)
    // - Local part should not start or end with a special character
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return false;
    }

    // - Domain name should not start or end with a special character
    if (domainName.startsWith('-') || domainName.endsWith('-')) {
        return false;
    }

    // If all checks pass, return true
    return true;

}

function checkEmailExists(email) {

    let sql = db.prepare("select count(*)  as count from user where email = ?")
    let result = sql.get(email);
    console.log("result.count", result)
    if (result.count > 0) {
        console.log("Email already exists")
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
    }
    else 
    if (!checkEmailExists(email)) {
        //return res.json({ error: 'Email already exists.' });

        res.redirect('/app.html?errorMsg=EmailExist');
    }
    else {
        // Insert new user
        const newUser = addUser(firstName, lastName, 2, 0, email);

        if (!newUser) {
            return res.json({ error: 'Failed to register user.' });
        }
    
        res.sendFile(path.join(staticPath, 'app.html'))

        //return res.json({ message: 'User registered successfully!', user: newUser });
}
    

});

function addUser(firstName, lastName, idRole, isAdmin, email)
 {


    sql = db.prepare("INSERT INTO user (firstName, lastName, idRole, isAdmin, email) " +
                         "values (?, ?, ?, ?, ?)")
    const info = sql.run(firstName, lastName, idRole, isAdmin, email)
    
    sql = db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role ' + 
        'FROM user inner join role on user.idrole = role.id   WHERE user.id  = ?');
    let rows = sql.all(info.lastInsertRowid)  
    console.log('row inserted', rows[0])

    return rows[0]
}

app.get('/getusers/', (req, resp) => {
    console.log('/getusers/')

    const sql = db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role ' + 
        'FROM user inner join role on user.idrole = role.id ');
    let users = sql.all()   
    console.log("users.length", users.length)
    
    resp.send(users)
})


app.use(express.static(staticPath));
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})