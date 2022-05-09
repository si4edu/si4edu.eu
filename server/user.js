import { createTransport } from 'nodemailer';
import https from 'https';

if (!FS.existsSync('users')) { FS.mkdirSync('users') }
if (!FS.existsSync('users/emails.json')) { FS.writeFileSync('users/emails.json', '{}'); }
if (!FS.existsSync('users/users.json')) { FS.writeFileSync('users/users.json', '{}'); }
const users = JSON.parse(FS.readFileSync('users/users.json'));
const emails = JSON.parse(FS.readFileSync('users/emails.json'));

app.post('/user/register', res => {
    res.onAborted(() => {});
    readJson(res, data => {
        if (
            Object.keys(data).length !== 13 ||
            !data.hasOwnProperty('captcha') || typeof data.captcha !== 'string' ||
            !data.hasOwnProperty('role') || typeof data.role !== 'string' ||
            !data.hasOwnProperty('name') || typeof data.name !== 'string' ||
            !data.hasOwnProperty('email') || typeof data.email !== 'string' ||
            !data.hasOwnProperty('pass') || typeof data.pass !== 'string' ||
            !data.hasOwnProperty('school') || typeof data.school !== 'string' ||
            !data.hasOwnProperty('age') || !Number.isInteger(data.age) ||
            !data.hasOwnProperty('gender') || typeof data.gender !== 'string' ||
            !data.hasOwnProperty('country') || typeof data.country !== 'string' ||
            !data.hasOwnProperty('city') || typeof data.city !== 'string' ||
            !data.hasOwnProperty('subjects') || !Array.isArray(data.subjects) ||
            !data.hasOwnProperty('lessons') || !Array.isArray(data.lessons) ||
            !data.hasOwnProperty('langs') || !Array.isArray(data.langs)
        ) {
            res.writeStatus('400'); res.end('0');
            return;
        }

        checkCaptcha(data.captcha, () => {
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
            emails[emailToken] = data.email;
            sendConfirmationMail(data, emailToken);
            FS.writeFileSync('users/emails.json', JSON.stringify(emails));
            
            res.end(data.token);
        }, () => {
            res.writeStatus('400'); res.end('0');
        });
        delete data.captcha;
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
//         res.end();
//     }, () => {
//         res.writeStatus('400');
//         res.end();
//     });
// });

app.post('/user/login', res => {
    res.onAborted(() => {});
    readJson(res, data => {
        if (
            Object.keys(data).length !== 3 ||
            !data.hasOwnProperty('captcha') ||
            !data.hasOwnProperty('email') ||
            !data.hasOwnProperty('pass')
        ) {
            res.writeStatus('400'); res.end('0');
            return;
        }

        checkCaptcha(data.captcha, () => {
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
    
            res.end(user.token);
        }, () => {
            res.writeStatus('400'); res.end('0');
        });
        delete data.captcha;
    });
});

app.get('/user/confirm', (res, req) => {
    res.onAborted(() => {});
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

app.get('/user/info', (res, req) => {
    res.onAborted(() => {});
    const token = req.getQuery();
    if (users.hasOwnProperty(token)) {
        res.end(FS.readFileSync(`users/${users[token]}`));
    } else {
        res.writeStatus('400');
        res.end();
    }
});

function generateToken(obj) {
    let token;
    do {
        token = randomBytes(16).toString('hex');
    } while (obj.hasOwnProperty(token));
    return token;
}

function checkCaptcha(token, success, error) {
    https.get(`https://google.com/recaptcha/api/siteverify?secret=${SECRETS.captcha}&response=${token}`, res => {
        let data = '';
        res.on('data', chunk => {
            data += chunk;
        });
        res.on('end', () => {
            if (JSON.parse(data).success) {
                success();
            } else {
                error();
            }
        });
    }).on('error', () => { error(); });
}

function readJson(res, success) {
    let buffer;
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
                success(json);
            } else {
                try {
                    json = JSON.parse(chunk);
                } catch (e) {
                    res.close();
                    return;
                }
                success(json);
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

function sendConfirmationMail(user, token) {
    transporter.sendMail({
        from: '"SI4EDU" noreply@si4edu.eu',
        to: user.email,
        subject: 'SI4EDU Confirm Registration',
        html:
        `<!DOCTYPE html>
        <body style="font-size: 20px;">
            <div style="margin: 0 auto; width: 100%; max-width: 800px">
                <div>
                    <img style="width: 90px; height: 60px;" src="https://user-images.githubusercontent.com/31388661/165814956-015c59ac-e7f2-4556-8a58-1d4dc4d3aefc.png" alt="Logo" />
                    <h1 style="margin: 10px 0; color: #20469B; font-size: 50px;">Welcome to SI4EDU!</h1>
                </div>
                <div style="color: #20469B;">
                    <p style="margin: 30px 0;">Dear ${user.name},<br>Complete registration by clicking the button below:</p>
                    <a style="background-color: #F9E319; color: #000; padding: 15px; margin: 10px 0; border-radius: 20px; font-size: 18px; text-decoration: none;" href="${URL}/user/confirm?${token}">Confirm Email</a></p>
                    <hr style="margin: 30px 0 10px 0;">
                    <p style="font-size: 15px;">If you did not request this email, please ignore it.</p>
                </div>
            </div>
        </body>`,
    });
}