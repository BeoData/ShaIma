const socket = new WebSocket('ws://localhost:8080/ws');

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');
const userList = document.getElementById('users');
const chatArea = document.getElementById('chat-area');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let username = '';

loginButton.addEventListener('click', () => {
  username = usernameInput.value.trim();
  if (username) {
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    socket.send(JSON.stringify({ type: 'join', username }));
  } else {
    alert('Morate uneti korisničko ime!');
  }
});

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'userList':
      userList.innerHTML = '';
      data.users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
      });
      break;

    case 'message':
      const messageDiv = document.createElement('div');
      messageDiv.textContent = `${data.username}: ${data.message}`;
      chatArea.appendChild(messageDiv);
      chatArea.scrollTop = chatArea.scrollHeight;
      break;

    default:
      console.warn('Unknown message type:', data.type);
  }
};

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'message', message, username }));
    messageInput.value = '';
  }
});

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = () => {
  console.log('WebSocket connection closed');
};