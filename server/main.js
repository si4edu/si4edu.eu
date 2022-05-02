import {createHash, randomBytes} from 'crypto';
import IG from 'instagram-web-api';
import fetch, { AbortError } from 'node-fetch';
embed('server/app.js');
embed('server/static.js');

let photos = [];

function fetchPhotos() {
    const client = new IG(JSON.parse(FS.readFileSync('instagram.json')));
    client.login().then(() => {
        client.getPhotosByUsername({ username: 'si4edu', first: 10 }).then(data => {
            data = data.user.edge_owner_to_timeline_media.edges;
            photos = [];
            for (const photo of data) {
                const code = photo.node.shortcode;
                fetch(photo.node.thumbnail_src).then(res => res.arrayBuffer()).then(data => {
                    FS.writeFileSync(`assets/instagram/${code}`, Buffer.from(data));
                    app.get(`/photos/${code}`, res => {
                        res.onAborted(() => { });
                        res.writeHeader('Content-Type', 'image/png');
                        res.end(data);
                    });
                }).catch(console.log);
                photos.push(code);
            }
        }).catch(console.log);
    }).catch(console.log);
}

FS.readdirSync('assets/instagram').forEach(file => {
    photos.push(file);
    const data = FS.readFileSync(`assets/instagram/${file}`);
    app.get(`/photos/${file}`, res => {
        res.onAborted(() => { });
        res.writeHeader('Content-Type', 'image/png');
        res.end(data)
    });
});

// Fetch photos every hour
// setInterval(fetchPhotos, 1000 * 60 * 30);

app.get('/photos', res => {
    res.onAborted(() => { });
    res.writeHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(photos));
});

app.post('/user/register', res => {
    readJson(res, (obj) => {
        if(!obj.hasOwnProperty("email") 
            || !obj.hasOwnProperty("password")) {
            res.writeHeader("status", "400");
            res.end();
            return;
        }
        if (!FS.existsSync("users/lookup.json")) {
            FS.writeFileSync("users/lookup.json", "{}");
        }
        let lookup = JSON.parse(FS.readFileSync("users/lookup.json"));
        let token;
        do {
            token = randomBytes(16).toString("hex");
        } while(lookup.hasOwnProperty(token));
        const filename = `users/${obj.email}`;
        if (FS.existsSync(filename)) {
            res.writeHeader("status", "405");
            res.end();
            return;
        }
        obj.password = createHash("sha256")
            .update(Buffer.from(obj.password))
            .digest("hex");
        const finalObj = {
            "email": obj.email,
            "password": obj.password,
            "token": token
        };
        FS.writeFileSync(filename, JSON.stringify(finalObj));
        lookup[token] = obj.email;
        FS.writeFileSync("users/lookup.json", JSON.stringify(lookup));
        res.writeHeader("status", "200");
        res.end();
    }, () => {
        res.writeHeader("status", "400");
        res.end();
    });
});

app.put('/user/update', res => {
    readJson(res, (obj) => {
        if(!obj.hasOwnProperty("token")) {
            res.writeHeader("status", "400");
            res.end();
            return;
        }
        const lookup = JSON.parse(FS.readFileSync("users/lookup.json"));
        if (!lookup.hasOwnProperty(obj.token)) {
            res.writeHeader("status", "404");
            res.end();
            return;
        }
        const filename = `users/${lookup[obj.token]}`;
        let user = JSON.parse(FS.readFileSync(filename));
        if (user.token !== obj.token) {
            res.writeHeader("status", "401");
            res.end()
            return;
        }
        for (var key in obj) {
            if(key === "password") {
                obj[key] = createHash("sha256")
                    .update(Buffer.from(obj.password))
                    .digest("hex");
            }
        }
        const finalObj = {
            "email": user.email,
            "password": obj.password,
            "token": user.token
        };
        FS.writeFileSync(filename, JSON.stringify(finalObj));
        res.writeHeader("status", "200");
        res.end();
    }, () => {
        res.writeHeader("status", "400");
        res.end();
    }); 
});

app.post('/user/login', res => {
    readJson(res, (obj) => {
        if(!obj.hasOwnProperty("email") 
            || !obj.hasOwnProperty("password")) {
            res.writeHeader("status", "400");
            res.end();
            return;
        }
        let filename = `users/${obj.email}`;
        if(!FS.existsSync(filename)) {
            res.writeHeader("status", "404");
            res.end();
            return;
        }
        obj.password = createHash("sha256")
            .update(Buffer.from(obj.password))
            .digest("hex");
        let user = JSON.parse(FS.readFileSync(filename));
        if(user.password !== obj.password) {
            res.writeHeader("status", "401");
            res.end();
            return;
        }
        res.writeHeader("status", "200");
        res.end(user.token);
    }, () => {
        res.writeHeader("status", "400");
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