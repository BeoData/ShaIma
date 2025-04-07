const express = require('express');
const expressWs = require('express-ws');
const cors = require('cors');

const app = express();
expressWs(app);

app.use(cors());

const users = new Map(); // username => ws
const activeConnections = new Set();

function broadcastUserList() {
  const userList = Array.from(users.keys());
  const message = JSON.stringify({ type: 'userList', users: userList });

  activeConnections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
}

function broadcastMessage(username, message) {
  const data = JSON.stringify({ type: 'message', username, message });

  activeConnections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  });
}

app.ws('/ws', (ws, req) => {
  activeConnections.add(ws);

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);

      switch (data.type) {
        case 'join':
          ws.username = data.username;
          users.set(data.username, ws);
          console.log(`User joined: ${data.username}`);
          broadcastUserList();
          break;

        case 'message':
          if (ws.username && data.message) {
            broadcastMessage(ws.username, data.message);
          }
          break;
      }
    } catch (error) {
      console.error('Invalid message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    activeConnections.delete(ws);
    if (ws.username && users.has(ws.username)) {
      users.delete(ws.username);
      broadcastUserList();
    }
  });
});

app.listen(8080, () => {
  console.log('WebSocket server running on ws://localhost:8080/ws');
});
