import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import express from 'express';
import { verifySchema } from './db.js';
import app from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');
const isProduction = existsSync(distPath);
const PORT = process.env.PORT || 3001;

if (isProduction) {
  app.use(express.static(distPath));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}${isProduction ? ' (serving frontend from dist/)' : ''}`);
  await verifySchema();
});
