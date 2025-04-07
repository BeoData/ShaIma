<<<<<<< HEAD
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
=======
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
>>>>>>> c3e4f6b09864564292d97c0927a3ff84fbd8feeb
});