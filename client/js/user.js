function userAutorun() {
    if (localStorage.token) {
        fetch(`/user/info?${localStorage.token}`, { method: 'GET' }).then(res => res.json()).then(data => {
            document.getElementById('login-button').style = 'display:none';
            document.getElementById('user-button').style.display = 'flex';
            const nameSplit = data.name.split(' ');
            document.getElementById('user-button').innerText = nameSplit[0][0] + (nameSplit.length > 1 ? nameSplit[1][0] : '');
            document.getElementById('user-name').innerText = data.name;
            document.getElementById('user-role').innerText = data.role === 's' ? 'Student' : 'Buddy';
            document.getElementById('user-school').value = data.school;
            document.getElementById('user-age').value = data.age;
            document.getElementById('user-gender').value = data.gender;
            document.getElementById('user-country').value = data.country;
            document.getElementById('user-city').value = data.city;
            data.subjects.forEach(s => { document.getElementById(`user-subject-${s}`).checked = true });
            data.lessons.forEach(s => { document.getElementById(`user-lesson-${s}`).checked = true });
            data.langs.forEach(s => { document.getElementById(`user-lang-${s}`).checked = true });
        });
    }

    document.getElementById('user-form').onsubmit = e => {
        e.preventDefault();
        document.getElementById('user-submit').setAttribute('disabled', true);
        fetch(`/user/update?${localStorage.token}`, {
            method: 'PUT',
            body: JSON.stringify({
                school: document.getElementById('user-school').value,
                city: document.getElementById('user-city').value,
                subjects: userSubjects.filter(s => document.getElementById(`user-subject-${s}`).checked),
                lessons: userLessons.filter(l => document.getElementById(`user-lesson-${l}`).checked),
                langs: userLangs.filter(l => document.getElementById(`user-lang-${l}`).checked),
            }),
        }).then(() => {
            document.getElementById('user-submit').removeAttribute('disabled');
        });
    };
}