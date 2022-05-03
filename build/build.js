import FS from 'fs';
import HtmlMinifier from 'html-minifier';
import Babel from '@babel/core';
import PostCSS from 'postcss';
import AutoPrefixer from 'autoprefixer';
const DEBUG = process.env.DEBUG ||  process.argv[2] == '--debug';

function load(path) { return FS.readFileSync(path).toString(); }

async function embed(file) {
    for (let i = 0; i < file.length; ++i) {
        if (file.substr(i, 7) == 'embed(\'') {
            let filename = '';
            for (let ii = i + 7; ii < file.length; ++ii) {
                if (file.substr(ii, 3) == '\');') {
                    break;
                }
                filename += file[ii];
            }
            let embeded = await embed(load(filename));
            if (!DEBUG) {
                if (filename.endsWith('main.js')) {
                    embeded = `(() => {${embeded}})();`;
                    embeded = Babel.transformSync(embeded, { presets: ['@babel/preset-env'] }).code;
                } else if (filename.endsWith('main.css')) {
                    embeded = await PostCSS([AutoPrefixer]).process(embeded).css;
                }
            }

            file = file.substr(0, i) + embeded + file.substr(i + 10 + filename.length);
        }
    }
    return file;
}

(async function () {
    if (!FS.existsSync('build/out')) { FS.mkdirSync('build/out'); }

    // Build Client
    let client = await embed(load('client/html/main.html'));
    if (!DEBUG) {
        client = HtmlMinifier.minify(client, { minifyCSS: true, minifyJS: true, removeComments: true, sortClassName: true, sortAttributes: true, collapseWhitespace: true });
    }
    FS.writeFileSync('build/out/client.html', client);

    // Build Server
    FS.writeFileSync('build/out/server.js', await embed(load('server/main.js')));
    FS.appendFileSync('build/out/server.js', await embed(load('server/user.js')));
})();