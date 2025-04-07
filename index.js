const express = require('express');
const expressWs = require('express-ws');
const path = require('path');

const app = express();
expressWs(app);

// Middleware za statičke fajlove
app.use(express.static(path.join(__dirname, 'public')));

// Aktivni korisnici i konekcije
const users = new Set();
const activeConnections = new Set();

function broadcastUserList() {
  const message = JSON.stringify({ type: 'userList', users: Array.from(users) });
  activeConnections.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.ws('/ws', (ws, req) => {
  console.log('Client connected.');
  activeConnections.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case 'join':
          if (data.username && !users.has(data.username)) {
            users.add(data.username);
            console.log(`User joined: ${data.username}`);
            broadcastUserList();
          }
          break;
        case 'message':
          const outgoing = JSON.stringify({
            type: 'message',
            username: data.username,
            message: data.message,
          });
          activeConnections.forEach((client) => {
            if (client.readyState === client.OPEN) {
              client.send(outgoing);
            }
          });
          break;
        default:
          console.warn('Unknown type:', data.type);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
    activeConnections.delete(ws);
    // Napomena: ovde ne možemo precizno znati korisničko ime bez dodatne logike.
    broadcastUserList();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
