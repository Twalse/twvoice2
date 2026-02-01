
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;

// Логируем содержимое папки при старте для диагностики
console.log('--- SERVER DIAGNOSTICS ---');
console.log('Current working directory:', process.cwd());
console.log('Files in directory:', fs.readdirSync(__dirname));

// Принудительная отдача index.js с корректным MIME-типом
app.get('/index.js', (req, res) => {
  const filePath = path.resolve(__dirname, 'index.js');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    return res.sendFile(filePath);
  } else {
    console.error('CRITICAL ERROR: index.js not found at', filePath);
    res.status(404).send('console.error("index.js not found. Check build logs.")');
  }
});

// Раздача всей статики
app.use(express.static(__dirname));

// Поддержка SPA: любой другой маршрут отдает index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ TwVoice server is running on port ${PORT}`);
});
