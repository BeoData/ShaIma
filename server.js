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

  // Dodavanje nove konekcije u skup aktivnih konekcija
  activeConnections.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          // Dodavanje korisnika u listu
          const username = data.username;
          if (username && !users.has(username)) {
            users.add(username);
            console.log(`User joined: ${username}`);
            broadcastUserList(activeConnections); // Šaljemo ažuriranu listu korisnika
          }
          break;

        case 'message':
          // Prosleđivanje poruke svim klijentima
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

    // Uklanjanje korisnika iz liste
    const username = [...users].find((user) => {
      return Array.from(activeConnections).some((client) => {
        const data = JSON.parse(client.upgradeReq.url.split('?')[1]);
        return data.username === user;
      });
    });
    if (username) {
      users.delete(username);
      console.log(`User left: ${username}`);
      broadcastUserList(activeConnections); // Šaljemo ažuriranu listu korisnika
    }
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