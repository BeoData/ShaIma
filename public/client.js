//const socket = new WebSocket('ws://localhost:8080/ws');
const socket = new WebSocket('wss://shaima.onrender.com/ws');

const username = prompt("Enter your username:");
socket.addEventListener('open', () => {
  socket.send(JSON.stringify({ type: 'join', username }));
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'userList') {
    console.log('Active users:', data.users);
  }

  if (data.type === 'message') {
    console.log(`${data.username}: ${data.message}`);
  }
});

function sendMessage(message) {
  socket.send(JSON.stringify({ type: 'message', message }));
}
