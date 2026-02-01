
const express = require('express');
const path = require('path');
const app = express();

// Render использует порт 10000 по умолчанию
const PORT = process.env.PORT || 10000;

// Логируем окружение для диагностики
console.log('--- TWVOICE DEPLOY LOG ---');
console.log('Timestamp:', new Date().toISOString());
console.log('Working Dir:', process.cwd());
console.log('__dirname:', __dirname);

// Раздаем статику из корня
// Так как все файлы (index.html, index.tsx) лежат в корне, используем __dirname
app.use(express.static(__dirname));

// Все GET запросы отправляем на index.html (поддержка SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('ERROR: Could not find index.html at', indexPath);
      res.status(500).send('File index.html not found. Check deployment structure.');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`🔗 App is available at: http://0.0.0.0:${PORT}`);
  console.log('--------------------------');
});
