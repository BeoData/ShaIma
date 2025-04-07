const express = require('express');
const expressWs = require('express-ws');
const path = require('path');

const app = express();
expressWs(app);

// Middleware za serviranje statičkih fajlova
app.use(express.static(path.join(__dirname, 'public')));

// Lista prijavljenih korisnika
const users = new Set();

// Helper funkcija za slanje liste korisnika svim klijentima
function broadcastUserList(activeConnections) {
  const userList = Array.from(users);
  const message = JSON.stringify({ type: 'userList', users: userList });
  for (const client of activeConnections) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

// Skup aktivnih WebSocket konekcija
const activeConnections = new Set();

// Glavna ruta za serviranje HTML stranice
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket ruta
app.ws('/ws', (ws, req) => {
  console.log('Client connected.');
  activeConnections.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          const username = data.username;
          if (username && !users.has(username)) {
            users.add(username);
            console.log(`User joined: ${username}`);
            broadcastUserList(activeConnections);
          }
          break;

        case 'message':
          const outgoingMessage = JSON.stringify({
            type: 'message',
            username: data.username,
            message: data.message,
          });
          for (const client of activeConnections) {
            if (client.readyState === client.OPEN) {
              client.send(outgoingMessage);
            }
          }
          break;

        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
    activeConnections.delete(ws);

    // Jednostavno ažuriraj listu bez komplikovanog username tracking-a
    broadcastUserList(activeConnections);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Pokretanje servera
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
