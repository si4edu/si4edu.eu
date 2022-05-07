import { createTransport } from 'nodemailer';

if (!FS.existsSync('users/emails.json')) {
    FS.writeFileSync('users/emails.json', '{}');
}
if (!FS.existsSync('users/users.json')) {
    FS.writeFileSync('users/users.json', '{}');
}
let lookupUsers = JSON.parse(FS.readFileSync('users/users.json'));
let lookupEmails = JSON.parse(FS.readFileSync('users/emails.json'));

app.post('/user/register', res => {
    readJson(res, (obj) => {
        if (!obj.hasOwnProperty('email') || !obj.hasOwnProperty('password') || !obj.hasOwnProperty('fullname') || !obj.hasOwnProperty('role')) {
            res.writeStatus('400');
            res.end();
            return;
        }
        let token;
        do {
            token = randomBytes(16).toString('hex');
        } while (lookupUsers.hasOwnProperty(token));
        const filename = `users/${obj.email}`;
        if (FS.existsSync(filename)) {
            res.writeStatus('405');
            res.end();
            return;
        }
        obj.password = createHash('sha256').update(Buffer.from(obj.password)).digest('hex');
        const finalObj = {
            email: obj.email,
            password: obj.password,
            fullname: obj.fullname,
            role: obj.role,
            token: token,
            confirmed: false
        };

        FS.writeFileSync(filename, JSON.stringify(finalObj));
        lookupUsers[token] = obj.email;
        FS.writeFileSync('users/users.json', JSON.stringify(lookupUsers));
        sendRegisterCode(obj.email);
        res.writeStatus('200');
        res.end();
    }, () => {
        res.writeStatus('400');
        res.end();
    });
});

app.put('/user/update', res => {
    readJson(res, obj => {
        if (!obj.hasOwnProperty('token')) {
            res.writeStatus('400');
            res.end();
            return;
        }
        if (!lookupUsers.hasOwnProperty(obj.token)) {
            res.writeStatus('404');
            res.end();
            return;
        }
        const filename = `users/${lookupUsers[obj.token]}`;
        let user = JSON.parse(FS.readFileSync(filename));
        if (user.token !== obj.token) {
            res.writeStatus('401');
            res.end()
            return;
        }
        if (obj.hasOwnProperty('password')) {
            obj.password = createHash('sha256')
                .update(Buffer.from(obj.password))
                .digest('hex');
        }
        let fullname = user.fullname;
        if (obj.hasOwnProperty('fullname')) {
            fullname = obj.fullname;
        }
        const finalObj = {
            email: user.email,
            password: obj.password,
            fullname: fullname,
            token: user.token
        };
        FS.writeFileSync(filename, JSON.stringify(finalObj));
        res.writeStatus('200');
        res.end();
    }, () => {
        res.writeStatus('400');
        res.end();
    });
});

app.post('/user/login', res => {
    readJson(res, obj => {
        if (!obj.hasOwnProperty('email') || !obj.hasOwnProperty('password')) {
            res.writeStatus('400');
            res.end();
            return;
        }
        console.log(obj.captcha);
        let filename = `users/${obj.email}`;
        if (!FS.existsSync(filename)) {
            res.writeStatus('404');
            res.end();
            return;
        }
        obj.password = createHash('sha256').update(Buffer.from(obj.password)).digest('hex');
        let user = JSON.parse(FS.readFileSync(filename));
        if (user.password !== obj.password) {
            res.writeStatus('401');
            res.end();
            return;
        }
        res.writeStatus('200');
        let token;
        do {
            token = randomBytes(16).toString('hex');
        } while (lookupEmails.hasOwnProperty(token));
        lookupEmails[token] = user.token;
        FS.writeFileSync('users/emails.json', JSON.stringify(lookupEmails));
        sendConfirmationCode(user.email, token);
        res.end(user.token);
    }, () => {
        res.writeStatus('400');
        res.end();
    });
});

app.get('/user/confirm', (res, req) => {
    const tokenHeader = req.getQuery();
    if (lookupEmails.hasOwnProperty(tokenHeader)) {
        const email = lookupUsers[lookupEmails[tokenHeader]];
        const user = JSON.parse(FS.readFileSync(`users/${email}`));
        user.confirmed = true;
        delete lookupEmails[tokenHeader];
        FS.writeFileSync('users/emails.json', JSON.stringify(lookupEmails));
        FS.writeFileSync(`users/${email}`, JSON.stringify(user));
        res.writeStatus('200');
    } else {
        res.writeStatus('403');
    }
    res.end();
});

function readJson(res, cb, err) {
    let buffer;
    res.onAborted(err);
    res.onData((ab, isLast) => {
        let chunk = Buffer.from(ab);
        if (isLast) {
            let json;
            if (buffer) {
                try {
                    json = JSON.parse(Buffer.concat([buffer, chunk]));
                } catch (e) {
                    res.close();
                    return;
                }
                cb(json);
            } else {
                try {
                    json = JSON.parse(chunk);
                } catch (e) {
                    res.close();
                    return;
                }
                cb(json);
            }
        } else {
            if (buffer) {
                buffer = Buffer.concat([buffer, chunk]);
            } else {
                buffer = Buffer.concat([chunk]);
            }
        }
    });
}

const transporter = createTransport({
    host: 'smtp.mail.us-east-1.awsapps.com',
    port: 465,
    secure: true,
    auth: {
        user: 'noreply@si4edu.eu',
        pass: SECRETS.pass
    }
});
function sendRegisterCode(email) {
    transporter.sendMail({
        from: '"SI4EDU" noreply@si4edu.eu',
        to: email,
        subject: 'Test subject',
        text: 'Test text',
        html: '<h1>Test HTML</h1>'
    });
}

function sendConfirmationCode(email, token) {
    // TODO
    // const link = "https://si4edu.eu/user/confirm?" + token;
    const link = "localhost:3001/user/confirm?" + token;
    transporter.sendMail({
        from: '"SI4EDU" noreply@si4edu.eu',
        to: email,
        subject: 'Welcome to Si4edu!',
        html: `<a href="${link}">Click here!</a>`
    });
}