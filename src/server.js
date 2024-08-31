import express from 'express';
import viewEngine from './config/viewEngine.js';
import initWebRouter from './router/web.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Config view engine
viewEngine(app);

// Parse request to json 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Init web route
initWebRouter(app);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Chat bot đang chạy ở cổng: ${port}`));
