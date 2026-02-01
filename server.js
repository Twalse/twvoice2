
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());

// Хранилище: { ROOM_CODE: { users: { userId: userData } } }
let roomsData = {};

// API для регистрации новой комнаты
app.post('/api/rooms', (req, res) => {
  const { code } = req.body;
  if (code) {
    const normalizedCode = code.trim().toUpperCase();
    if (!roomsData[normalizedCode]) {
      roomsData[normalizedCode] = { users: {} };
    }
    console.log(`[SERVER] Room active: "${normalizedCode}"`);
    return res.json({ success: true });
  }
  res.status(400).json({ error: 'Code is required' });
});

// API для проверки существования комнаты
app.get('/api/rooms/:code', (req, res) => {
  const normalizedCode = req.params.code.trim().toUpperCase();
  const exists = !!roomsData[normalizedCode];
  res.json({ exists });
});

// API для синхронизации статуса участника и получения списка всех в комнате
app.post('/api/rooms/:code/sync', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { user } = req.body;

  if (!roomsData[code]) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const now = Date.now();

  // Обновляем данные текущего пользователя
  if (user && user.id) {
    roomsData[code].users[user.id] = { 
      ...user, 
      lastSeen: now 
    };
  }

  // Очистка "мертвых" душ (кто не отвечал более 10 секунд)
  const activeUsers = {};
  Object.keys(roomsData[code].users).forEach(id => {
    if (now - roomsData[code].users[id].lastSeen < 10000) {
      activeUsers[id] = roomsData[code].users[id];
    }
  });
  roomsData[code].users = activeUsers;

  // Возвращаем список всех участников без служебных полей
  const participants = Object.values(activeUsers).map(({ lastSeen, ...u }) => u);
  res.json({ participants });
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
