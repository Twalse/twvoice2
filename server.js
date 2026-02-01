
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;

console.log('--- TWVOICE DEPLOYMENT STATUS ---');
console.log('Current directory:', __dirname);
console.log('Files in directory:', fs.readdirSync(__dirname));

// Принудительно устанавливаем MIME-тип для JS модулей
app.get('/index.js', (req, res) => {
  const filePath = path.join(__dirname, 'index.js');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(filePath);
  } else {
    console.error('CRITICAL ERROR: index.js was not found! Check build logs.');
    res.status(404).send('index.js not found. Make sure "npm run build" succeeded.');
  }
});

// Стандартная раздача статики для остальных файлов
app.use(express.static(__dirname));

// SPA роутинг: все остальные запросы отдают index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ App server is running on port ${PORT}`);
});
