const WebSocket = require('ws');
const port = 8080; // Prilagodite port prema klijentu
const wss = new WebSocket.Server({ port: port });

console.log(`WebSocket server started on port ${port}`);

wss.on('connection', (ws) => {
    console.log('Client connected.');
    console.log('connection state:', ws.readyState);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // ... obrada poruke ...
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        console.log('connection state:', ws.readyState);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        console.log('connection state:', ws.readyState);
    });
});

wss.on('error', (error) => {
    console.error('Server error:', error);
});