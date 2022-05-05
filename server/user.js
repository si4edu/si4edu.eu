import pkg from 'nodemailer';
const {createTransport} = pkg;

app.post('/user/register', res => {
    readJson(res, (obj) => {
        if (!obj.hasOwnProperty('email') || !obj.hasOwnProperty('password') || !obj.hasOwnProperty('fullname') || !obj.hasOwnProperty('role')) {
            res.writeStatus('400');
            res.end();
            return;
        }
        if (!FS.existsSync('users/lookup.json')) {
            FS.writeFileSync('users/lookup.json', '{}');
        }
        let lookup = JSON.parse(FS.readFileSync('users/lookup.json'));
        let token;
        do {
            token = randomBytes(16).toString('hex');
        } while(lookup.hasOwnProperty(token));
        const filename = `users/${obj.email}`;
        if (FS.existsSync(filename)) {
            res.writeStatus('405');
            res.end();
            return;
        }
        obj.password = createHash('sha256')
            .update(Buffer.from(obj.password))
            .digest('hex');
        const finalObj = {
            email: obj.email,
            password: obj.password,
            fullname: obj.fullname,
            role: obj.role,
            token: token
        };
        FS.writeFileSync(filename, JSON.stringify(finalObj));
        lookup[token] = obj.email;
        FS.writeFileSync('users/lookup.json', JSON.stringify(lookup));
        sendRegMail(obj.email);
        res.writeStatus('200');
        res.end();
    }, () => {
        res.writeStatus('400');
        res.end();
    });
});

app.put('/user/update', res => {
    readJson(res, (obj) => {
        if (!obj.hasOwnProperty('token')) {
            res.writeStatus('400');
            res.end();
            return;
        }
        const lookup = JSON.parse(FS.readFileSync('users/lookup.json'));
        if (!lookup.hasOwnProperty(obj.token)) {
            res.writeStatus('404');
            res.end();
            return;
        }
        const filename = `users/${lookup[obj.token]}`;
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
    readJson(res, (obj) => {
        if (!obj.hasOwnProperty('email') 
            || !obj.hasOwnProperty('password')) {
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
        obj.password = createHash('sha256')
            .update(Buffer.from(obj.password))
            .digest('hex');
        let user = JSON.parse(FS.readFileSync(filename));
        if (user.password !== obj.password) {
            res.writeStatus('401');
            res.end();
            return;
        }
        res.writeStatus('200');
        res.end(user.token);
    }, () => {
        res.writeStatus('400');
        res.end();
    });
});

function readJson(res, cb, err) {
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

    res.onAborted(err);
}

function sendRegMail(mail) {
    const password = FS.readFileSync('mail'); 
    let transporter = createTransport({
        host: "smtp.mail.us-east-1.awsapps.com",
        port: 465,
        secure: true,
        auth: {
            user: "noreply@si4edu.eu",
            pass: password
        }
    });

    let info = transporter.sendMail({
        from: '"Someone" noreply@si4edu.eu',
        to: mail,
        subject: "Test subject",
        text: "Test text",
        html: "<h1>Test HTML</h1>"
    });
    
    info.then(d => {
        console.log('Message sent: %s', d.messageId);
    });
}