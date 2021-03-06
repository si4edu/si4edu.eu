function getProfile() {
    fetch(`/user/info?${localStorage.token}`, { method: 'GET' }).then(res => res.json()).then(data => {
        document.getElementById('login-button').style = 'display:none';
        document.getElementById('user-button').style.display = 'flex';
        const nameSplit = data.name.split(' ');
        document.getElementById('user-button').innerText = nameSplit[0][0] + (nameSplit.length > 1 ? nameSplit[1][0] : '');
        document.getElementById('profile-name').innerText = data.name;
        document.getElementById('profile-role').innerText = data.role === 's' ? 'Student' : 'Buddy';
        document.getElementById('profile-school').value = data.school;
        document.getElementById('profile-age').value = data.age;
        document.getElementById('profile-gender').value = data.gender;
        document.getElementById('profile-country').value = data.country;
        document.getElementById('profile-city').value = data.city;
        data.subjects.forEach(s => { document.getElementById(`profile-subject-${s}`).checked = true });
        data.lessons.forEach(s => { document.getElementById(`profile-lesson-${s}`).checked = true });
        data.langs.forEach(s => { document.getElementById(`profile-lang-${s}`).checked = true });
        data.matches.forEach(m => {
            addMatch(m);
        });
        data.schedule.forEach(b => {
            addScheduleBlock(b);
        });
    });
}

let scheduleAdding;
function makeScheduleBlock() {
    const block = document.createElement('div');
    block.classList.add('schedule-block');
    block.style = `height:${1 * 50 - 2}px;pointer-events:none`;

    block.nameText = document.createElement('h1');
    block.nameText.innerText = 'New Class';
    block.appendChild(block.nameText);

    block.name = document.createElement('input');
    block.name.setAttribute('placeholder', 'Class Name');
    block.name.value = 'New Class';
    block.name.oninput = () => {
        block.nameText.innerText = block.name.value;
    };
    block.appendChild(block.name);

    block.person = document.createElement('select');
    updateScheduleBlockPeople(block);
    block.appendChild(block.person);

    block.subject = document.createElement('select');
    block.subject.innerHTML = '<option value="" disabled selected>Subject</option><option value="biology">Biology</option><option value="chemistry">Chemistry</option><option value="mathematics">Mathematics</option><option value="physics">Physics</option><option value="geography">Geography</option><option value="polish">Polish</option><option value="english">English</option><option value="german">German</option><option value="french">French</option>';
    block.appendChild(block.subject);

    block.lesson = document.createElement('select');
    block.lesson.innerHTML = '<option value="" disabled selected>Lesson Type</option><option value="irl">In person</option><option value="online">Online</option>';
    block.appendChild(block.lesson);

    block.dayInput = document.createElement('input');
    block.dayInput.setAttribute('placeholder', 'Week day');
    block.dayInput.setAttribute('type', 'number');
    block.dayInput.setAttribute('min', '1');
    block.dayInput.setAttribute('max', '7');
    block.dayInput.oninput = () => {
        block.day = Math.min(Math.max(block.dayInput.value, 1), 7);
    };
    block.appendChild(block.dayInput);

    block.startInput = document.createElement('input');
    block.startInput.setAttribute('placeholder', 'Start hour');
    block.startInput.setAttribute('type', 'number');
    block.startInput.setAttribute('min', '6');
    block.startInput.setAttribute('max', '21.75');
    block.startInput.setAttribute('step', '0.25');
    block.startInput.oninput = () => {
        block.start = Math.min(Math.max(block.startInput.value, 6), 21.75);
    };
    block.appendChild(block.startInput);

    block.endInput = document.createElement('input');
    block.endInput.setAttribute('placeholder', 'End hour');
    block.endInput.setAttribute('type', 'number');
    block.endInput.setAttribute('min', '6.25');
    block.endInput.setAttribute('max', '22');
    block.endInput.setAttribute('step', '0.25');
    block.endInput.oninput = () => {
        block.end = Math.min(Math.max(block.endInput.value, 6.25), 22);
    };
    block.appendChild(block.endInput);

    const removeButton = document.createElement('button');
    removeButton.innerText = 'Remove';
    removeButton.classList.add('button');
    removeButton.onclick = e => {
        e.stopPropagation();
        if (confirm('Are you sure you want to remove this class?')) {
            block.remove();
        }
        return false;
    };
    block.appendChild(removeButton);

    block.onclick = e => {
        e.stopPropagation();
        document.querySelectorAll('.schedule-block').forEach(e => {
            e.classList.remove('schedule-block-open');
        });
        if (!scheduleAdding) {
            block.classList.add('schedule-block-open');
        }
        return false;
    };
    return block;
}

function updateScheduleBlockPeople(block) {
    const value = block.person.value;
    block.person.innerHTML = '<option value="" disabled selected>Person</option>' + matches.map(m => `<option value="${m.email}">${m.name}</option>`).join('');
    block.person.value = value;
}

function updateScheduleBlock(block) {
    updateScheduleBlockPeople(block);
    block.dayInput.value = block.day;
    block.startInput.value = block.start;
    block.endInput.value = block.end
    block.style = `height:${(block.end - block.start) * 50 - 2}px`;
    block.style.transform = `translateY(${(block.start - 6) * 50}px)`;
    document.querySelector(`#schedule-table tr:nth-child(2) > td:nth-child(${parseInt(block.day) + 1})`).appendChild(block);
}

function addScheduleBlock(data) {
    const block = makeScheduleBlock();
    block.nameText.innerText = block.name.value = data.name;
    block.person.value = data.person;
    block.subject.value = data.subject;
    block.lesson.value = data.lesson;
    block.dayInput.value = block.day = data.day;
    block.startInput.value = block.start = data.start;
    block.endInput.value = block.end = data.end;
    updateScheduleBlock(block);
}

let matches = [];
function addMatch(data) {
    const person = document.createElement('div');
    person.classList.add('match-person');
    const name = document.createElement('span');
    name.innerText = `${data.name} (${data.email})`;
    person.appendChild(name);
    const ageGender = document.createElement('span');
    ageGender.innerText = `${data.age} years old (${data.gender})`;
    person.appendChild(ageGender);
    const subjects = document.createElement('span');
    subjects.innerText = data.subjects.join(', ');
    person.appendChild(subjects);
    const lessons = document.createElement('span');
    lessons.innerText = data.lessons.join(', ');
    person.appendChild(lessons);
    const langs = document.createElement('span');
    langs.innerText = data.langs.join(', ');
    person.appendChild(langs);
    const removeButton = document.createElement('button');
    removeButton.classList.add('button');
    removeButton.innerText = 'Remove';
    const index = matches.length;
    matches.push(data);
    removeButton.onclick = () => {
        fetch(`/user/matches/remove?${localStorage.token}&${index}`, {
            method: 'DELETE',
        }).then(() => {
            person.remove();
        });
    };
    person.appendChild(removeButton);
    document.getElementById('matches-list').appendChild(person);
}

function userAutorun() {
    if (localStorage.token) { getProfile(); }

    document.getElementById('profile-form').onsubmit = e => {
        e.preventDefault();
        if (!captcha) { return; }
        document.getElementById('profile-submit').setAttribute('disabled', true);
        fetch(`/user/profile/update?${localStorage.token}`, {
            method: 'PUT',
            body: JSON.stringify({
                captcha: captcha,
                school: document.getElementById('profile-school').value,
                age: parseInt(document.getElementById('profile-age').value),
                gender: document.getElementById('profile-gender').value,
                country: document.getElementById('profile-country').value,
                city: document.getElementById('profile-city').value,
                subjects: userSubjects.filter(s => document.getElementById(`profile-subject-${s}`).checked),
                lessons: userLessons.filter(l => document.getElementById(`profile-lesson-${l}`).checked),
                langs: userLangs.filter(l => document.getElementById(`profile-lang-${l}`).checked),
            }),
        }).then(() => {
            grecaptcha.reset(2);
            document.getElementById('profile-submit').removeAttribute('disabled');
        });
    };

    window.onclick = () => {
        document.querySelectorAll('.schedule-block').forEach(block => {
            block.classList.remove('schedule-block-open');
            updateScheduleBlock(block);
        });
    };
    const scheduleAdd = document.getElementById('schedule-add');
    scheduleAdd.onclick = () => {
        scheduleAdding = !scheduleAdding;
        if (scheduleAdding) {
            scheduleAdd.innerText = 'Cancel';
        } else {
            block.remove();
            cancelScheduleAdding();
        }
    };
    let block;
    function cancelScheduleAdding() {
        scheduleAdding = false;
        block = makeScheduleBlock();
        scheduleAdd.innerText = 'Add';
    }
    cancelScheduleAdding();
    document.querySelectorAll('#schedule-table td').forEach(e => {
        if (e.cellIndex !== 0) {
            e.onmouseover = () => {
                if (scheduleAdding) {
                    e.appendChild(block);
                }
            };
            e.onclick = () => {
                block.dayInput.value = block.day = e.cellIndex;
                block.startInput.value = block.start = parseInt(e.parentNode.getAttribute('start'));
                block.endInput.value = block.end = block.start + 1;
                block.style.pointerEvents = 'all';
                cancelScheduleAdding();
            };
        }
    });

    const scheduleSubmit = document.getElementById('schedule-submit');
    scheduleSubmit.onclick = () => {
        fetch(`/user/schedule/update?${localStorage.token}`, {
            method: 'PUT',
            body: JSON.stringify(
                Array.from(document.getElementsByClassName('schedule-block')).map(block => {
                    return {
                        name: block.name.value,
                        person: block.person.value,
                        subject: block.subject.value,
                        lesson: block.lesson.value,
                        day: parseInt(block.day),
                        start: parseInt(block.start),
                        end: parseInt(block.end),
                    }
                })
            ),
        });
    };

    document.getElementById('matches-new').onclick = () => {
        if (confirm('Are you sure you want to get a new match?')) {
            fetch(`/user/matches/add?${localStorage.token}`, {
                method: 'POST',
            }).then(res => {
                if (res.status === 200) {
                    return res.json();
                } else if (res.status === 400) {
                    alert('No new matches available!');
                }
            }).then(data => {
                addMatch(data);
            });
        }
    };
}