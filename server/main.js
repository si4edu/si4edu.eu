import {createHash} from 'crypto';
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

app.post('/user/register', (res, req) => {
  const query = req.getQuery().toString().split("%00");
  const filename = `users/${query[0]}.json`;
  if(FS.existsSync(filename)) {
    res.end("User already exists");
    return;
  }
  const password = createHash('sha256')
    .update(Buffer.from(query[1]))
    .digest('hex');
  if(query.length !== 2) {
    res.end("Invalid number of arguments");
    return;
  }
  const obj = {
    "email": query[0],
    "password": password
  };
  FS.writeFileSync(filename, JSON.stringify(obj));
  res.end("Added user to the database");
});

app.put('/user/update', (res, req) => {
  const query = req.getQuery().toString().split("%00");
  if(query.length !== 4) {
    res.end("Invalid number of arguments");
    return;
  }
  let filename = `users/${query[0]}.json`;
  if(!FS.existsSync(filename)) {
    res.end("User doesn't exist");
    return;
  }
  const password = createHash('sha256')
    .update(Buffer.from(query[1]))
    .digest('hex');
  let user = JSON.parse(FS.readFileSync(filename));
  if(user.password !== password) {
    res.end("Passwords doesn't match");
    return;
  }
  FS.unlinkSync(filename);
  user.email = query[2];
  user.password = createHash('sha256')
    .update(Buffer.from(query[3]))
    .digest('hex');
  FS.writeFileSync(`users/${query[2]}.json`, JSON.stringify(user));
  res.end("User updated");
});

app.post('/user/login', (res, req) => {
  const query = req.getQuery().toString().split("%00");
  let filename = `users/${query[0]}.json`;
  if(query.length !== 2) {
    res.end("Invalid number of arguments");
    return;
  }
  if(!FS.existsSync(filename)) {
    res.end("User doesn't exist");
    return;
  }
  const password = createHash('sha256')
    .update(Buffer.from(query[1]))
    .digest('hex');
  let user = JSON.parse(FS.readFileSync(filename));
  if(user.password !== password) {
    res.end("Invalid Password");
    return;
  }
  res.end("User logged in");
});