document.getElementById('activityForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const activity = {
        idUser: document.getElementById('idUser').value,
        startTime: document.getElementById('startTime').value,
        idSubject: document.getElementById('idSubject').value,
        idRoom: document.getElementById('idRoom').value,
        idStatus: document.getElementById('idStatus').value,
        duration: document.getElementById('duration').value,
    };

    try {
        const response = await fetch('/addactivity', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(activity)
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById('error').innerText = data.error;
            document.getElementById('success').innerText = '';
        } else {
            document.getElementById('error').innerText = '';
            document.getElementById('success').innerText = 'Aktiviet er regristrert!';
        }
    } catch (error) {
        document.getElementById('error').innerText = 'Oisann, her gikk noe galt. Vennligst prøv igjen!.';
        console.error('Error:', error);
    }
});
