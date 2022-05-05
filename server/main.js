import {createHash, randomBytes} from 'crypto';
import IG from 'instagram-web-api';
import fetch from 'node-fetch';
import FS from 'fs';

const SECRETS = JSON.parse(FS.readFileSync("secrets.json"));
embed('server/app.js');
embed('server/static.js');
embed('server/user.js');

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
        res.end(data);
    });
});

// Fetch photos every hour
// setInterval(fetchPhotos, 1000 * 60 * 30);

app.get('/photos', res => {
    res.onAborted(() => { });
    res.writeHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(photos));
});
