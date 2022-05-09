function userAutorun() {
    if (localStorage.token) {
        document.getElementById('login-button').style = 'display:none';
        fetch(`/user/info?${localStorage.token}`, { method: 'GET' }).then(res => res.json()).then(data => {
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
        document.getElementById('user-button').innerText = 'XD';
    }
}