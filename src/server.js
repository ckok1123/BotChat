import express from 'express';
import dotenv from 'dotenv';
import viewEngine from './config/viewEngine.js';
import initWebRouter from './router/web.js';
import bodyParser from 'body-parser';

dotenv.config(); // Khởi tạo dotenv

const app = express();

// Cấu hình view engine
viewEngine(app);

// Phân tích request sang JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Khởi tạo route
initWebRouter(app);

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Chat bot đang chạy ở cổng: ${port}`);
});
