import UWS from 'uWebSockets.js';

const DEBUG = process.env.DEBUG || process.argv[2] == '--debug';
const PORT = process.env.PORT || (DEBUG ? 3001 : 443);
const URL = DEBUG ? `http://localhost:${PORT}` : 'https://si4edu.eu';

const app = DEBUG ? UWS.App() : UWS.SSLApp({
    cert_file_name: 'cert.pem',
    key_file_name: 'key.pem',
});

app.listen('0.0.0.0', PORT, token => {
    if (token) {
        console.log(`Listening on port ${PORT}...`);
    }
});