function registerAutorun() {
    document.getElementById('register-form').onsubmit = e => {
        e.preventDefault();
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
            if (res.status === 200) {
                return res.text();
            } else if (res.status === 400) {
                res.text().then(data => {
                    if (data === '1') {
                        document.getElementById('register-email-taken').style = "block";
                    }
                });
            }
        }).then(data => {
            localStorage.token = data;
        });
    };
    document.getElementById('login-form').onsubmit = e => {
        e.preventDefault();
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
            if (res.status === 200) {
                return res.text();
            } else if (res.status === 400) {
                res.text().then(data => {
                    if (data === '1') {
                        document.getElementById('login-invalid-email').style.display = "block";
                    } else if (data === '2') {
                        document.getElementById('login-invalid-password').style.display = "block";
                    }
                });
            }
        }).then(data => {
            localStorage.token = data;
        });
    };
}