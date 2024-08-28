import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import axios from 'axios';
import initWebRouter from './router/web.js';

dotenv.config(); // Khởi tạo dotenv

const app = express();

// Cấu hình middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Khởi tạo route
initWebRouter(app);

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Chat bot đang chạy ở cổng: ${port}`);
});
