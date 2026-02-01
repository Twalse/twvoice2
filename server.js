
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());

// Хранилище: { ROOM_CODE: { users: { userId: userData }, messages: [] } }
let roomsData = {};

app.post('/api/rooms', (req, res) => {
  const { code } = req.body;
  if (code) {
    const normalizedCode = code.trim().toUpperCase();
    if (!roomsData[normalizedCode]) {
      roomsData[normalizedCode] = { users: {}, messages: [] };
    }
    console.log(`[SERVER] Room active: "${normalizedCode}"`);
    return res.json({ success: true });
  }
  res.status(400).json({ error: 'Code is required' });
});

app.get('/api/rooms/:code', (req, res) => {
  const normalizedCode = req.params.code.trim().toUpperCase();
  const exists = !!roomsData[normalizedCode];
  res.json({ exists });
});

// Добавление сообщения в комнату
app.post('/api/rooms/:code/messages', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { message } = req.body;
  if (roomsData[code] && message) {
    roomsData[code].messages.push(message);
    // Ограничим историю 50 сообщениями
    if (roomsData[code].messages.length > 50) roomsData[code].messages.shift();
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Room or message missing' });
});

app.post('/api/rooms/:code/sync', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { user } = req.body;

  if (!roomsData[code]) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const now = Date.now();

  if (user && user.id) {
    roomsData[code].users[user.id] = { 
      ...user, 
      lastSeen: now 
    };
  }

  const activeUsers = {};
  Object.keys(roomsData[code].users).forEach(id => {
    if (now - roomsData[code].users[id].lastSeen < 10000) {
      activeUsers[id] = roomsData[code].users[id];
    }
  });
  roomsData[code].users = activeUsers;

  res.json({ 
    participants: Object.values(activeUsers),
    messages: roomsData[code].messages 
  });
});

app.get('/index.js', (req, res) => {
  const filePath = path.resolve(__dirname, 'index.js');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    return res.sendFile(filePath);
  } else {
    res.status(404).send('console.error("index.js not found")');
  }
});

app.use(express.static(__dirname));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ TwVoice server is running on port ${PORT}`);
});
