app.post('/user/register', res => {
    readJson(res, (obj) => {
        if (!obj.hasOwnProperty('email') || !obj.hasOwnProperty('password') || !obj.hasOwnProperty('fullname') || !obj.hasOwnProperty('role')) {
            res.writeHeader('status', '400');
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
            res.writeHeader('status', '405');
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
        res.writeHeader('status', '200');
        res.end();
    }, () => {
        res.writeHeader('status', '400');
        res.end();
    });
});

app.put('/user/update', res => {
    readJson(res, (obj) => {
        if (!obj.hasOwnProperty('token')) {
            res.writeHeader('status', '400');
            res.end();
            return;
        }
        const lookup = JSON.parse(FS.readFileSync('users/lookup.json'));
        if (!lookup.hasOwnProperty(obj.token)) {
            res.writeHeader('status', '404');
            res.end();
            return;
        }
        const filename = `users/${lookup[obj.token]}`;
        let user = JSON.parse(FS.readFileSync(filename));
        if (user.token !== obj.token) {
            res.writeHeader('status', '401');
            res.end()
            return;
        }
        if (obj.hasOwnProperty('password')) {
            obj.password = createHash('sha256')
                .update(Buffer.from(obj.password))
                .digest('hex');
        }
        const finalObj = {
            email: user.email,
            password: obj.password,
            token: user.token
        };
        FS.writeFileSync(filename, JSON.stringify(finalObj));
        res.writeHeader('status', '200');
        res.end();
    }, () => {
        res.writeHeader('status', '400');
        res.end();
    }); 
});

app.post('/user/login', res => {
    readJson(res, (obj) => {
        if (!obj.hasOwnProperty('email') 
            || !obj.hasOwnProperty('password')) {
            res.writeHeader('status', '400');
            res.end();
            return;
        }
        let filename = `users/${obj.email}`;
        if (!FS.existsSync(filename)) {
            res.writeHeader('status', '404');
            res.end();
            return;
        }
        obj.password = createHash('sha256')
            .update(Buffer.from(obj.password))
            .digest('hex');
        let user = JSON.parse(FS.readFileSync(filename));
        if (user.password !== obj.password) {
            res.writeHeader('status', '401');
            res.end();
            return;
        }
        res.writeHeader('status', '200');
        res.end(user.token);
    }, () => {
        res.writeHeader('status', '400');
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