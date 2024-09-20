// Eksempel på en liste med personer
let persons = [];

const personTable = document.getElementById('personTable');
const addPersonBtn = document.getElementById('addPersonBtn');
addPersonBtn.addEventListener('click', addPersonForm);
const personForm = document.getElementById('personForm');

const contextMenu = document.getElementById('contextMenu');
let selectedRow;


personTable.addEventListener('contextmenu', function(event) {
    //event.preventDefault();
    if (event.target.tagName === 'TD') {
        selectedRow = event.target.parentElement; // get the selected row
        const rect = event.target.getBoundingClientRect();
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.display = 'block';
    }
});

fetchRandomUsers()
displayPersonsAsTable()


function displayPersonsAsTable() {
    
    personTable.innerHTML = '<tr><th>Navn</th><th>Alder</th><th>Epost</th></tr>'; // Tøm tabellen først
    
    persons.forEach(person => {
        const row = document.createElement('tr');
        row.dataset.id = person.email; 
        const nameCell = document.createElement('td');
        nameCell.textContent = person.name;
        row.appendChild(nameCell);
        
        const ageCell = document.createElement('td');
        ageCell.textContent = person.age;
        row.appendChild(ageCell);
        
        const emailCell = document.createElement('td');
        emailCell.textContent = person.email;
        row.appendChild(emailCell);
        
        personTable.appendChild(row);
    });
}


function addPersonForm() {
    personForm.style.display = 'block';
    addPersonBtn.style.display = 'none';
    document.getElementById('personForm').addEventListener('submit' , handleAddPerson);
}

function handleAddPerson(event) {
    event.preventDefault(); // Avbryter at siden reloades
    addPerson(personForm.firstName.value + personForm.lastName.value, 
            personForm.age.value,
            personForm.email.value)
    personForm.reset();
    personForm.style.display = 'none';
    addPersonBtn.style.display = 'block';
}

function handleEditPerson(event) {
    event.preventDefault(); // Avbryter at siden reloades
    let person = persons.find(p => p.email === selectedRow.dataset.id);
    person.name = personForm.firstName.value +' ' + personForm.lastName.value;
    person.age = personForm.age.value;
    person.email = personForm.email.value;
    personForm.reset();
    personForm.style.display = 'none';
    addPersonBtn.style.display = 'block';

    displayPersonsAsTable(); // Oppdater visningen
    personForm.removeEventListener('click', handleEditPerson)
    personForm.addEventListener('submit' , handleAddPerson);


}

// Funksjon for å hente tilfeldige brukere fra Random User API


    async function fetchRandomUsers() {
        try {
            // Fetch API brukes for å hente data fra URLen
            let response = await fetch('https://randomuser.me/api/?results=5'); // Henter 5 tilfeldige brukere
            let data = await response.json(); // Konverterer responsen til JSON
    
            // Nå må vi iterere gjennom data.results, ikke data direkte
            for (let i = 0; i < data.results.length; i++) {
                addPerson(data.results[i].name.first + ' ' + data.results[i].name.last, data.results[i].dob.age, data.results[i].email);
            }
    
            console.log(data); // Logger hentet data for testing
        } catch (error) {
            console.error('Error:', error); // Håndterer eventuelle feil
        }
    }
    

    
    function addPerson(name, age, email) {
        const newPerson = {
            name: name,
            age: age,
            email: email
        };
        persons.push(newPerson);
        displayPersonsAsTable(); // Oppdater visningen
    }


    document.getElementById('cancelBtn').addEventListener('click', function() {
        personForm.reset();
        personForm.style.display = 'none';
        addPersonBtn.style.display = 'block';
    });
    
    
    document.getElementById('editRow').addEventListener('click', function() {
        if (selectedRow) {

            const cells = selectedRow.getElementsByTagName('td');

            personForm.style.display = 'block';

            const [firstName, lastName] = cells[0].textContent.split(' ');
            personForm.firstName.value = firstName
            personForm.lastName.value = lastName;
            personForm.email.value = cells[2].innerText;
            personForm.age.value = cells[1].innerText;
             // Switch to edit mode
             personForm.style.display = 'block';
             addPersonBtn.style.display = 'none';
             personForm.removeEventListener('submit', handleAddPerson);
             personForm.addEventListener('click', handleEditPerson);

             contextMenu.style.display = 'none';
        }
    });


    
    document.getElementById('deleteRow').addEventListener('click', function() {
        if (selectedRow) {

            const cells = selectedRow.getElementsByTagName('td');
            let id = selectedRow.dataset.id;
            for (let i = 0; i < persons.length; i++) {
                if (persons[i].email === id) {
                    persons.splice(i, 1);
                    break;
                }
            }
             contextMenu.style.display = 'none';
             displayPersonsAsTable(); // Oppdater visningen
        }
    });