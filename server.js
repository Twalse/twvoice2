
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;

// Middleware для обработки JSON
app.use(express.json());

// Временное хранилище комнат (в памяти сервера)
let activeRooms = [];

// API для регистрации новой комнаты
app.post('/api/rooms', (req, res) => {
  const { code } = req.body;
  if (code && !activeRooms.includes(code.toUpperCase())) {
    activeRooms.push(code.toUpperCase());
    console.log(`Room created: ${code}. Total active rooms: ${activeRooms.length}`);
  }
  res.json({ success: true });
});

// API для проверки существования комнаты
app.get('/api/rooms/:code', (req, res) => {
  const exists = activeRooms.includes(req.params.code.toUpperCase());
  res.json({ exists });
});

// Принудительная отдача index.js с корректным MIME-типом
app.get('/index.js', (req, res) => {
  const filePath = path.resolve(__dirname, 'index.js');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    return res.sendFile(filePath);
  } else {
    res.status(404).send('console.error("index.js not found. Check build logs.")');
  }
});

// Раздача статики
app.use(express.static(__dirname));

// Поддержка SPA
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ TwVoice server is running on port ${PORT}`);
});
