import express from 'express';
import viewEngine from './config/viewEngine.js'; // Đảm bảo thêm .js vào đường dẫn
import initWebRouter from './router/web.js'; // Đảm bảo thêm .js vào đường dẫn
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config(); // Đảm bảo rằng biến môi trường được nạp

const app = express();

// Config view engine
viewEngine(app);

// Parse request to json 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Init web route
initWebRouter(app);

const port = process.env.PORT || 8080; // Sử dụng biến môi trường PORT

app.listen(port, () => {
    console.log(`Chat bot đang chạy ở cổng: ${port}`);
});
