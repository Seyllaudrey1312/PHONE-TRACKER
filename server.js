const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static('public'));

let activeDevices = {};

// 1. Endpoint for the Phone App to send data
app.post('/api/update', (req, res) => {
    const { imei, lat, lng, screenTime, networks } = req.body;
    const timestamp = new Date().toLocaleString();

    activeDevices[imei] = { imei, lat, lng, screenTime, networks, timestamp };

    // Send data to the Dashboard via WebSockets
    io.emit('device-update', activeDevices[imei]);
    res.status(200).json({ status: "success" });
});

// 2. Endpoint for Dashboard to trigger Override
app.post('/api/override/:imei', (req, res) => {
    const imei = req.params.imei;
    console.log(`Sending override command to: ${imei}`);
    io.emit(`command-${imei}`, { action: 'LOCK_DEVICE' });
    res.json({ status: "Override command broadcasted" });
});

const PORT = process.env.PORT || 3000; // Uses server port or 3000
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});