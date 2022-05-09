function userAutorun() {
    if (localStorage.token) {
        document.getElementById('login-button').style = 'display:none';
        fetch(`/user/info?${localStorage.token}`, { method: 'GET' }).then(res => res.json()).then(data => {
            const nameSplit = data.name.split(' ');
            document.getElementById('user-button').innerText = nameSplit[0][0] + (nameSplit.length > 1 ? nameSplit[1][0] : '');
            document.getElementById('user-name').innerText = data.name;
            document.getElementById('user-role').innerText = data.role === 's' ? 'Student' : 'Buddy';
            document.getElementById('user-school').value = data.school;
            document.getElementById('user-age').value = data.age;
            document.getElementById('user-gender').value = data.gender;
            document.getElementById('user-country').value = data.country;
            document.getElementById('user-city').value = data.city;
            // TODO: subjects
            // TODO: lesson
            // TODO: langs
        }).catch(() => {
            delete localStorage.token;
            location.reload();
        });
        document.getElementById('user-button').style.display = 'flex';
    }

    document.getElementById('user-form').onsubmit = e => {
        e.preventDefault();
        document.getElementById('user-submit').setAttribute('disabled', true);
        fetch(`/user/update?${localStorage.token}`, {
            method: 'PUT',
            body: JSON.stringify({
                school: document.getElementById('user-school').value,
                city: document.getElementById('user-city').value,
                subjects: [],
                lessons: [],
                langs: [],
            }),
        }).then(() => {
            document.getElementById('user-submit').removeAttribute('disabled');
        });
    };
}