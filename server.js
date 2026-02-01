
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());

// Хранилище: { ROOM_CODE: { users: { userId: { ..., mailbox: [] } }, messages: [] } }
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

app.post('/api/rooms/:code/messages', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { message } = req.body;
  if (roomsData[code] && message) {
    roomsData[code].messages.push(message);
    if (roomsData[code].messages.length > 50) roomsData[code].messages.shift();
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Room or message missing' });
});

app.post('/api/rooms/:code/sync', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { user, signalsToSend } = req.body;

  if (!roomsData[code]) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const now = Date.now();

  // Инициализация пользователя, если его нет
  if (user && user.id) {
    if (!roomsData[code].users[user.id]) {
      roomsData[code].users[user.id] = { ...user, mailbox: [] };
    }
    // Обновляем статус и время
    roomsData[code].users[user.id] = { 
      ...roomsData[code].users[user.id],
      ...user,
      lastSeen: now 
    };

    // Рассылка сигналов другим участникам
    if (signalsToSend && Array.isArray(signalsToSend)) {
      signalsToSend.forEach(sig => {
        if (roomsData[code].users[sig.to]) {
          roomsData[code].users[sig.to].mailbox.push({ from: user.id, ...sig });
        }
      });
    }
  }

  // Очистка неактивных
  const activeUsers = {};
  Object.keys(roomsData[code].users).forEach(id => {
    if (now - roomsData[code].users[id].lastSeen < 10000) {
      activeUsers[id] = roomsData[code].users[id];
    }
  });
  roomsData[code].users = activeUsers;

  // Забираем сигналы для текущего пользователя и очищаем его ящик
  const mySignals = (user && user.id && roomsData[code].users[user.id]) 
    ? [...roomsData[code].users[user.id].mailbox] 
    : [];
  if (user && user.id && roomsData[code].users[user.id]) {
    roomsData[code].users[user.id].mailbox = [];
  }

  res.json({ 
    participants: Object.values(activeUsers).map(u => {
        const { mailbox, lastSeen, ...publicData } = u;
        return publicData;
    }),
    messages: roomsData[code].messages,
    signalsForMe: mySignals
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
