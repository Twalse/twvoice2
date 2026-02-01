
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;

// Логирование для отладки на Render
console.log('--- STARTUP CHECK ---');
console.log('Current directory:', __dirname);
try {
  const files = fs.readdirSync(__dirname);
  console.log('Files in root:', files);
} catch (e) {
  console.error('Could not read directory');
}

// Принудительная обработка JS файлов для избежания ошибок MIME-типа
app.get('/index.js', (req, res) => {
  const filePath = path.join(__dirname, 'index.js');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    return res.sendFile(filePath);
  } else {
    console.error('ERROR: index.js not found at', filePath);
    res.status(404).send('console.error("index.js not found - build failed?")');
  }
});

// Раздача остальных статических файлов
app.use(express.static(__dirname));

// SPA Fallback: все остальные запросы отдают index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
