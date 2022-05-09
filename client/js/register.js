function registerAutorun() {
    const registerPassword = document.getElementById('register-password');
    const registerRepeatPassword = document.getElementById('register-repeat-password');
    registerPassword.oninput = () => {
        registerPassword.setCustomValidity(registerPassword.value.length < 6 ? 'Password is too short' : '');
        registerRepeatPassword.oninput();
    };
    registerRepeatPassword.oninput = () => {
        registerRepeatPassword.setCustomValidity(registerPassword.value !== registerRepeatPassword.value ? 'Passwords don\'t match' : '');
    };
    document.getElementById('register-form').onsubmit = e => {
        e.preventDefault();
        document.getElementById('register-error-email').style = 'display:none';
        if (!captcha) { return; }
        document.getElementById('register-submit').setAttribute('disabled', true);
        fetch('/user/register', {
            method: 'POST',
            body: JSON.stringify({
                captcha: captcha,
                role: document.getElementById('register-role-buddy').checked ? 'b' : 's',
                name: document.getElementById('register-fullname').value,
                email: document.getElementById('register-email').value,
                pass: sha256(registerPassword.value),
                school: document.getElementById('register-school').value,
                age: parseInt(document.getElementById('register-age').value),
                gender: document.getElementById('register-gender').value,
                country: document.getElementById('register-country').value,
                city: document.getElementById('register-city').value,
                subjects: [],
                lessons: [],
                langs: [],
            })
        }).then(res => {
            grecaptcha.reset(0);
            document.getElementById('register-submit').removeAttribute('disabled');
            if (res.status === 200) {
                return res.text();
            } else if (res.status === 400) {
                res.text().then(data => {
                    if (data === '1') {
                        document.getElementById('register-error-email').style = '';
                    }
                });
            }
        }).then(data => {
            localStorage.token = data;
        });
    };
    document.getElementById('login-form').onsubmit = e => {
        e.preventDefault();
        document.getElementById('login-error-email').style = document.getElementById('login-error-password').style = 'display:none';
        if (!captcha) { return; }
        document.getElementById('login-submit').setAttribute('disabled', true);
        fetch('/user/login', {
            method: 'POST',
            body: JSON.stringify({
                captcha: captcha,
                email: document.getElementById('login-email').value,
                pass: sha256(document.getElementById('login-password').value),
            })
        }).then(res => {
            grecaptcha.reset(1);
            document.getElementById('login-submit').removeAttribute('disabled');
            if (res.status === 200) {
                return res.text();
            } else if (res.status === 400) {
                res.text().then(data => {
                    if (data === '1') {
                        document.getElementById('login-error-email').style = '';
                    } else if (data === '2') {
                        document.getElementById('login-error-password').style = '';
                    }
                });
            }
        }).then(data => {
            localStorage.token = data;
        });
    };
}