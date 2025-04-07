<<<<<<< HEAD
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
=======
document.addEventListener('DOMContentLoaded', () => {
    const socket = new WebSocket('ws://localhost:8080');
    const chatArea = document.getElementById('chat-area');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const usernameInput = document.getElementById('username-input');
    const loginButton = document.getElementById('login-button');
    const usersList = document.getElementById('users');
    const loginContainer = document.getElementById('login-container');

    let username = null;
    sendButton.disabled = true;

    loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        const usernameValue = usernameInput.value.trim();
        if (usernameValue) {
            username = usernameValue;
            socket.send(JSON.stringify({ type: 'login', username }));
            loginContainer.style.display = "none"; // Hide login form
            sendButton.disabled = false;
        } else {
            alert('Please enter a username.');
        }
    });

    sendButton.addEventListener('click', (event) => {
        event.preventDefault();
        const message = messageInput.value.trim();
        if (message && username) {
            socket.send(JSON.stringify({ type: 'message', message, username }));
            messageInput.value = '';
        } else if (!message) {
            alert("Please enter a message");
        }
    });

    socket.addEventListener('open', () => {
        console.log('WebSocket connection established.');
    });

    socket.addEventListener('message', (event) => {
        try {
            const eventData = JSON.parse(event.data);
            if (eventData.type === 'message') {
                chatArea.innerHTML += `<p><strong>${eventData.username}:</strong> ${eventData.message}</p>`;
                chatArea.scrollTop = chatArea.scrollHeight;
            } else if (eventData.type === 'userList') {
                usersList.innerHTML = '';
                eventData.users.forEach(user => {
                    const li = document.createElement('li');
                    li.textContent = user;
                    usersList.appendChild(li);
                });
            }
        } catch (error) {
            console.error("Error parsing message: ", error);
        }
    });

    socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed.', event);
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });
});
>>>>>>> c3e4f6b09864564292d97c0927a3ff84fbd8feeb
