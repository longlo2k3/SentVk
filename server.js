const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5500;

const staticDir = path.join(__dirname);

app.use(express.static(staticDir));

// SPA fallback: serve index.html for any unknown route (so /admin works)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
