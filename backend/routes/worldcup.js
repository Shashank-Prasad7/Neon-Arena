const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

function loadData() {
  const filePath = path.join(__dirname, '..', 'data', 'worldcup-groups.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// GET /api/worldcup
router.get('/', (req, res) => {
  res.json(loadData());
});

module.exports = router;
