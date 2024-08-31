import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { VERIFY_TOKEN, PAGE_ACCESS_TOKEN } = process.env;

// Trang chủ
const getHomePage = (req, res) => res.send("Xin chào, chào mừng bạn đến với chatbot!");

// Xác thực webhook
const getWebhook = (req, res) => {
    const { mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(mode ? 403 : 400);
};

// Xử lý webhook POST request
const postWebhook = async (req, res) => {
    const { object, entry } = req.body;

    if (object === 'page') {
        try {
            for (const { messaging } of entry) {
                for (const messagingEvent of messaging) {
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
            return res.sendStatus(500);
        }
    }
    return res.sendStatus(404);
};

// Xử lý tin nhắn
const handleMessage = async (senderPsid, receivedMessage) => {
    const response = receivedMessage.text
        ? { text: `Bạn đã gửi: "${receivedMessage.text}".` }
        : { text: "Tôi đã nhận được một tệp đính kèm!" };

    await callSendAPI(senderPsid, response);
};

// Xử lý postback
const handlePostback = async (senderPsid) => {
    const response = { text: "Postback nhận được!" };
    await callSendAPI(senderPsid, response);
};

// Gửi tin nhắn qua API
const callSendAPI = async (senderPsid, response) => {
    const requestBody = {
        recipient: { id: senderPsid },
        message: response
    };

    try {
        const { status, data } = await axios.post('https://graph.facebook.com/v20.0/me/messages', requestBody, {
            params: { access_token: PAGE_ACCESS_TOKEN },
            headers: { 'Content-Type': 'application/json' }
        });

        if (status === 200) {
            console.log('Message sent successfully:', data);
        } else {
            console.error('Failed to send message:', status, data);
        }
    } catch (error) {
        console.error('Unable to send message:', error.response?.data || error.message);
    }
};

export { getHomePage, getWebhook, postWebhook, handlePostback, handleMessage, callSendAPI };
