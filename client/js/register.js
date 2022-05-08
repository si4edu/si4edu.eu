function registerAutorun() {
    document.getElementById('register-form').onsubmit = e => {
        e.preventDefault();
        document.getElementById('register-error-email').style = 'display:none';
        if (!captcha) { return; }
        const fullname = document.getElementById('register-fullname').value;
        const email = document.getElementById('register-email').value;
        const pass = sha256(document.getElementById('register-password').value);
        const role = document.getElementById('buddy-role').checked ? 'b' : 's';
        fetch('/user/register', {
            method: 'POST',
            body: JSON.stringify({
                captcha: captcha,
                fullname: fullname,
                email: email,
                pass: pass,
                role: role
            })
        }).then(res => {
            grecaptcha.reset(0);
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
        const email = document.getElementById('login-email').value;
        const pass = sha256(document.getElementById('login-password').value);
        fetch('/user/login', {
            method: 'POST',
            body: JSON.stringify({
                captcha: captcha,
                email: email,
                pass: pass,
            })
        }).then(res => {
            grecaptcha.reset(1);
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