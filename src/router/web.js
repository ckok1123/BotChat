import express from 'express';
import { getHomePage, getWebhook, postWebhook } from '../controller/chatbotController.js';

const router = express.Router();

const initWebRouter = (app) => {
    router.get("/", getHomePage);
    router.get("/webhook", getWebhook);
    router.post("/webhook", postWebhook);

    app.use("/", router);
};

export default initWebRouter;
