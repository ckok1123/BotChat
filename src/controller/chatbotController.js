import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;  // Sử dụng VERIFY_TOKEN cho việc xác thực webhook
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;  // Sử dụng PAGE_ACCESS_TOKEN cho API


const getHomePage = (req, res) => {
    return res.send("Xin chào, chào mừng bạn đến với chatbot!");
};

const getWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403); // Forbidden
        }
    } else {
        return res.sendStatus(400); // Bad Request
    }
};

const postWebhook = async (req, res) => {
    const data = req.body;

    if (data.object === 'page') {
        try {
            for (const entry of data.entry) {
                for (const messagingEvent of entry.messaging) {
                    const senderPsid = messagingEvent.sender.id;
                    if (messagingEvent.message) {
                        await handleMessage(senderPsid, messagingEvent.message);
                    } else if (messagingEvent.postback) {
                        await handlePostback(senderPsid, messagingEvent.postback);
                    }
                }
            }
            return res.status(200).send('EVENT_RECEIVED');
        } catch (error) {
            console.error('Error handling webhook event:', error);
            return res.sendStatus(500); // Internal Server Error
        }
    } else {
        return res.sendStatus(404); // Not Found
    }
};

const handleMessage = async (senderPsid, receivedMessage) => {
    let response;
    if (receivedMessage.text) {
        response = {
            text: `Bạn đã gửi: "${receivedMessage.text}".`
        };
    } else if (receivedMessage.attachments) {
        response = {
            text: "Tôi đã nhận được một tệp đính kèm!"
        };
    }
    await callSendAPI(senderPsid, response);
};

const handlePostback = async (senderPsid, postback) => {
    // Xử lý postback nếu cần
    const response = {
        text: "Postback nhận được!"
    };
    await callSendAPI(senderPsid, response);
};

const callSendAPI = async (senderPsid, response) => {
    try {
        await axios.post(`https://graph.facebook.com/v12.0/me/messages`, {
            recipient: {
                id: senderPsid
            },
            message: response
        }, {
            params: {
                access_token: PAGE_ACCESS_TOKEN
            }
        });
        console.log('Message sent!');
    } catch (error) {
        console.error('Unable to send message:', error);
    }
};

export { getHomePage, getWebhook, postWebhook };
