const express = require('express');
const expressWs = require('express-ws');
const cors = require('cors');

const app = express();
expressWs(app);

app.use(cors());
app.use(express.static('public')); // Da serviraš npr. index.html

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

        default:
          console.warn('Nepoznata poruka:', data);
      }
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Disconnected: ${ws.username || 'unknown user'}`);
    activeConnections.delete(ws);
    if (ws.username && users.has(ws.username)) {
      users.delete(ws.username);
      broadcastUserList();
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
});
