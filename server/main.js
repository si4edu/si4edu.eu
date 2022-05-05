import { createHash, randomBytes } from 'crypto';
import FS from 'fs';

const SECRETS = JSON.parse(FS.readFileSync('secrets.json'));

embed('server/app.js');
embed('server/static.js');
embed('server/instagram.js');
embed('server/user.js');