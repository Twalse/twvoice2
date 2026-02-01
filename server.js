
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;

console.log('--- SERVER STARTUP ---');
console.log('Directory:', __dirname);
const files = fs.readdirSync(__dirname);
console.log('Files present:', files);

if (!files.includes('index.js')) {
  console.error('⚠️ WARNING: index.js not found in directory! Build might have failed.');
}

// Служим статику. Express сам выставляет правильные MIME-типы.
app.use(express.static(__dirname));

// Поддержка SPA: все запросы, которые не попали в статику, отдают index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ App server is running on port ${PORT}`);
});
