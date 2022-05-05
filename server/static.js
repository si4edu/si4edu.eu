function load(path) { return FS.readFileSync(path); }

function get(name, data, type) {
    app.get(`/${name}`, res => {
        res.onAborted(() => { });
        res.writeHeader('Cache-Control', 'max-age=86400');
        res.writeHeader('Content-Type', type);
        res.end(data);
    });
}

get('favicon.ico', load('assets/favicon.ico'), 'image/vnd.microsoft.icon');
get('icon192.png', load('assets/icon192.png'), 'image/png');
get('logo.png', load('assets/logo.png'), 'image/png');
get('logoBig.png', load('assets/logoBig.png'), 'image/png');
get('robots.txt', load('assets/robots.txt'), 'text/plain');
get('sitemap.xml', load('assets/sitemap.xml'), 'application/xml');
get('about.pdf', load('assets/about.pdf'), 'application/pdf');

for (const team of FS.readdirSync('assets/team')) {
    get(`team/${team}`, load(`assets/team/${team}`), 'image/png');
}

const html = load('build/out/client.html');
app.get('/**', res => {
    res.onAborted(() => { });
    res.writeHeader('Content-Type', 'text/html');
    res.end(html);
});