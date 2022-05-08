import { createTransport } from 'nodemailer';

if (!FS.existsSync('users')) { FS.mkdirSync('users') }
if (!FS.existsSync('users/emails.json')) { FS.writeFileSync('users/emails.json', '{}'); }
if (!FS.existsSync('users/users.json')) { FS.writeFileSync('users/users.json', '{}'); }
const users = JSON.parse(FS.readFileSync('users/users.json'));
const emails = JSON.parse(FS.readFileSync('users/emails.json'));

app.post('/user/register', res => {
    readJson(res, data => {
        if (
            !data.hasOwnProperty('captcha') ||
            !data.hasOwnProperty('email') ||
            !data.hasOwnProperty('pass') ||
            !data.hasOwnProperty('fullname') ||
            !data.hasOwnProperty('role')
        ) {
            res.writeStatus('400'); res.end('0');
            return;
        }

        const filename = `users/${data.email}`;
        if (FS.existsSync(filename)) {
            res.writeStatus('400'); res.end('1');
            return;
        }

        data.token = generateToken(users);
        data.confirmed = false;
        FS.writeFileSync(filename, JSON.stringify(data));
        
        users[data.token] = data.email;
        FS.writeFileSync('users/users.json', JSON.stringify(users));
        
        const emailToken = generateToken(emails);
        emails[emailToken] = email;
        sendConfirmationCode(data.email, emailToken);
        FS.writeFileSync('users/emails.json', JSON.stringify(emails));
        
        res.writeStatus('200');
        res.end(user.token);
    }, () => {
        res.writeStatus('400'); res.end('0');
    });
});

// app.put('/user/update', res => {
//     readJson(res, obj => {
//         if (!obj.hasOwnProperty('token')) {
//             res.writeStatus('400');
//             res.end();
//             return;
//         }
//         if (!users.hasOwnProperty(obj.token)) {
//             res.writeStatus('404');
//             res.end();
//             return;
//         }
//         const filename = `users/${users[obj.token]}`;
//         let user = JSON.parse(FS.readFileSync(filename));
//         if (user.token !== obj.token) {
//             res.writeStatus('401');
//             res.end();
//             return;
//         }
//         if (obj.hasOwnProperty('password')) {
//             obj.password = createHash('sha256').update(Buffer.from(obj.password)).digest('hex');
//         }
//         let fullname = user.fullname;
//         if (obj.hasOwnProperty('fullname')) {
//             fullname = obj.fullname;
//         }
//         const finalObj = {
//             email: user.email,
//             password: obj.password,
//             fullname: fullname,
//             token: user.token
//         };
//         FS.writeFileSync(filename, JSON.stringify(finalObj));
//         res.writeStatus('200');
//         res.end();
//     }, () => {
//         res.writeStatus('400');
//         res.end();
//     });
// });

app.post('/user/login', res => {
    readJson(res, data => {
        if (
            !data.hasOwnProperty('captcha') ||
            !data.hasOwnProperty('email') ||
            !data.hasOwnProperty('pass')
        ) {
            res.writeStatus('400'); res.end('0');
            return;
        }

        const filename = `users/${data.email}`;
        if (!FS.existsSync(filename)) {
            res.writeStatus('400'); res.end('1');
            return;
        }

        const user = JSON.parse(FS.readFileSync(filename));
        if (user.pass !== data.pass) {
            res.writeStatus('400'); res.end('2');
            return;
        }

        res.writeStatus('200');
        res.end(user.token);
    }, () => {
        res.writeStatus('400'); res.end('0');
    });
});

app.get('/user/confirm', (res, req) => {
    const token = req.getQuery();
    if (emails.hasOwnProperty(token)) {
        const email = emails[token];
        delete emails[token];
        FS.writeFileSync('users/emails.json', JSON.stringify(emails));
        
        const user = JSON.parse(FS.readFileSync(`users/${email}`));
        user.confirmed = true;
        FS.writeFileSync(`users/${email}`, JSON.stringify(user));
        
        res.writeStatus('302');
        res.writeHeader('Location', `/?${user.token}`);
    } else {
        res.writeStatus('400');
        res.end(html);
    }
});

function generateToken(obj) {
    let token;
    do {
        token = randomBytes(16).toString('hex');
    } while (obj.hasOwnProperty(token));
    return token;
}

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

function sendConfirmationCode(email, token) {
    const link = `${URL}/user.confirm?${token}`;
    transporter.sendMail({
        from: '"SI4EDU" noreply@si4edu.eu',
        to: email,
        subject: 'Welcome to SI4EDU',
        html: emailContent(email, link)
    });
}

function emailContent(email, link) {
    let content = FS.readFileSync('email.html').toString();
    content = content.replace('%NAME%', email);
    content = content.replaceAll('%LINK%', link);
    return content;
}