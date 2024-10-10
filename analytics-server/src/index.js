const express = require('express');
const fs = require('fs');
const path = require('path');

(async () => {
  const analyticsFilePath = path.resolve(__dirname, '../data', 'analytics.json');

  if (!fs.existsSync(analyticsFilePath)) {
    fs.mkdirSync(path.dirname(analyticsFilePath), { recursive: true });
    fs.writeFileSync(analyticsFilePath, '{}', { encoding: 'utf8' });
  }

  const _content = await fs.promises.readFile(analyticsFilePath, { encoding: 'utf8' });
  const analyticsData = !_content ? {} : JSON.parse(_content);

  const app = express();
  app.use(express.json());

  const port = process.env.PORT || 3000;

  app.post('/analytics', (req, res) => {
    const data = req.body;

    analyticsData[data.user] = data.token;
    fs.writeFileSync(analyticsFilePath, JSON.stringify(analyticsData, null, 2), { encoding: 'utf8' });

    res.sendStatus(200);
  });

  app.listen(port, () => console.log('Analytics Service running on port 3000'));
})();
