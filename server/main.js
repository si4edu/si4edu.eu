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

app.post('/user/login', res => {
    readJson(res, (obj) => {
        res.end(jwt(obj));
    }, () => {
        res.end()
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

function jwt(ctx) {
  const header = Buffer.from(JSON.stringify({
    "alg": "SHA256",
    "typ": "JWT"
  })).toString('base64');
  const content = Buffer.from(JSON.stringify(ctx)).toString('base64');
  const sec = Buffer.from(FS.readFileSync("secret.txt")).toString('base64');
  const hash = createHash('sha256').update(header + Buffer.from(".").toString('base64') + content + Buffer.from(".").toString('base64') + sec).digest('base64');
  return hash;
}