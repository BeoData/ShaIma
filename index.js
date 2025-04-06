const WebSocket = require('ws');
const port = 8080;
const wss = new WebSocket.Server({ port: port });

const users = new Map();

console.log(`WebSocket server started on port ${port}`);

wss.on('connection', (ws) => {
    console.log('Client connected.');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'login') {
                users.set(ws, data.username);
                broadcastUserList();
            } else if (data.type === 'message') {
                const username = users.get(ws);
                broadcastMessage(username, data.message);
            }

        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        users.delete(ws);
        broadcastUserList();
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function broadcastMessage(username, message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', username, message }));
        }
    });
}

function broadcastUserList() {
    const userList = Array.from(users.values());
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'userList', users: userList }));
        }
    });
}