const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Minimal server is working!' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}`);
});
