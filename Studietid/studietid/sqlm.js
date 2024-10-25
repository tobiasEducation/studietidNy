// sqlm.js
const sqlite3 = require('better-sqlite3')
global.db  = sqlite3('./studietid.db', {verbose: console.log})




 function checkEmailExists(email) {

    let sql = global.db.prepare("select count(*)  as count from user where email = ?")
    let result = sql.get(email);
    console.log("result.count", result)
    if (result.count > 0) {
        console.log("Email already exists")
        return false;
    }
    return true;

}

function addActivity(idUser, idRoom, idSubject)
 {

    console.log('Adding activity', idUser, idRoom, idSubject);
    let sql = global.db.prepare("INSERT INTO activity (idUser, idRoom, idSubject, idStatus, starttime, duration) " +
                         "values (?, ?, ?, ?, ?, ?)")
    
                         
    // Step 1: Get the current time
    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0]; // YYYY-MM-DD HH:MM:SS format


    // Step 2: Round to the nearest hour (set minutes, seconds, and milliseconds to zero)
    //currentDateTime.setMinutes(0, 0, 0);

    // Step 3: Output the result as an ISO string (or any other desired format)

    const info = sql.run(idUser, idRoom, idSubject, 1, currentDateTime, 60)
    
    sql = global.db.prepare(`SELECT starttime, room.name as rom, subject.name as fag, status.name as status
                            FROM activity
                            inner join room on room.id = activity.idRoom
                            inner join subject on subject.id = activity.idSubject
                            inner join user on user.id = activity.idUser
                            inner join status on status.id = activity.idStatus
                            where activity.id = ?`);

    let row = sql.all(info.lastInsertRowid)  
    console.log('row inserted', row[0])

    return row[0]
}

function addUser(firstName, lastName, idRole, isAdmin, email)
 {


    sql = global.db.prepare("INSERT INTO user (firstName, lastName, idRole, isAdmin, email) " +
                         "values (?, ?, ?, ?, ?)")
    const info = sql.run(firstName, lastName, idRole, isAdmin, email)
    
    sql = global.db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role ' + 
        'FROM user inner join role on user.idrole = role.id   WHERE user.id  = ?');
    let row = sql.all(info.lastInsertRowid)  
    console.log('row inserted', rows[0])

    return row
}

function getUserByEmail(email) {
    const sql = global.db.prepare('SELECT user.id as userid, password, firstname, lastname, role.name  as role ' + 
        'FROM user inner join role on user.idrole = role.id  WHERE email = ?');
    let user = sql.get(email)   
    return user
}

function getUser(id) {
    const sql = global.db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role ' + 
        'FROM user inner join role on user.idrole = role.id  WHERE user.id = ?');
    let user = sql.get(id)   
    return user
}

function checkValidEmailFormat(email) {
    const emailRegex = /^[^\s@\.][^\s@]*@[^\s@]+\.[^\s@]+$/;
    let result = emailRegex.test(email);
 
    if (!result) {
        return false;
    }
    else return true


}

function getUsers() {
    const sql = global.db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role ' + 
        'FROM user inner join role on user.idrole = role.id ');
    let users = sql.all()   
    return users
}

function getRooms() {
    const sql = global.db.prepare('select id, name  from room');
    let rooms = sql.all()  
    return rooms

}

function getSubjects() {
    const sql = global.db.prepare('select id, name  from subject');
    let subjects = sql.all()  
    return subjects
}



module.exports = {
    getUser,
    getUserByEmail,
    getUsers,
    addUser,
    checkEmailExists,
    checkValidEmailFormat,
    addActivity,
    getRooms,
    getSubjects
};