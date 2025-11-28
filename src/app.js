require('dotenv').config({
    path: require('path').resolve(process.cwd(), '.env')
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./routes/api');

if (!process.env.REPLICATE_API_TOKEN) {
    console.error('Missing REPLICATE_API_TOKEN in .env file');
    process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const publicDistDir = path.join(process.cwd(), 'public', 'dist');
app.use(express.static(publicDistDir));

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {
        recursive: true
    });
    console.log('Created uploads directory');
}
app.use('/uploads', express.static(uploadsDir));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDistDir, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Unknown error'
    });
});

module.exports = app;