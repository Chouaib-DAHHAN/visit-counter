const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;   // Azure uses 8080
const FILE = path.join(__dirname, 'visits.json');

let lock = false;

function readCounter() {
    try {
        if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ count: 0 }));
        return JSON.parse(fs.readFileSync(FILE)).count;
    } catch { return 0; }
}

function writeCounter(count) {
    fs.writeFileSync(FILE, JSON.stringify({ count }, null, 2));
}

app.get('/', async (req, res) => {
    while (lock) await new Promise(r => setTimeout(r, 10));
    lock = true;
    try {
        let count = readCounter();
        count++;
        writeCounter(count);
        const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        res.send(`
      <h2>Chouaib Dahhan .</h2>
      <h2>Compteur de visites .</h2>
      <p><strong>Visites :</strong> ${count}</p>
      <p><strong>IP client :</strong> ${clientIP}</p>
      <p><strong>Hostname :</strong> ${req.hostname}</p>
    `);
    } finally { lock = false; }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
