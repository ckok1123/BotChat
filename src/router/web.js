import express from 'express';
import { getHomePage, getWebhook, postWebhook } from '../controller/chatbotController.js';

const router = express.Router();

const initWebRouters = (app) => {
    router.get("/", getHomePage);
    router.get("/webhook", getWebhook);
    router.post("/webhook", postWebhook);

    return app.use("/", router);
};

export default initWebRouters;
