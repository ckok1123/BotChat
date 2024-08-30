import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;  // Sử dụng VERIFY_TOKEN cho việc xác thực webhook
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;  // Sử dụng PAGE_ACCESS_TOKEN cho API

// Trang chủ
const getHomePage = (req, res) => {
    console.log("GET / - Home page request received");
    return res.send("Xin chào, chào mừng bạn đến với chatbot!");
};

// Xác thực webhook
const getWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log(`GET /webhooks - mode: ${mode}, token: ${token}, challenge: ${challenge}`);

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return res.status(200).send(challenge);
        } else {
            console.log('Webhook verification failed');
            return res.sendStatus(403); // Forbidden
        }
    } else {
        console.log('Invalid query parameters');
        return res.sendStatus(400); // Bad Request
    }
};

// Xử lý webhook POST request
const postWebhook = async (req, res) => {
    const data = req.body;

    console.log('POST /webhooks - Received webhook data:', JSON.stringify(data, null, 2));

    if (data.object === 'page') {
        try {
            for (const entry of data.entry) {
                for (const messagingEvent of entry.messaging) {
                    const senderPsid = messagingEvent.sender.id;
                    console.log(`Processing messaging event from sender PSID: ${senderPsid}`);

                    if (messagingEvent.message) {
                        console.log('Received message event:', JSON.stringify(messagingEvent.message, null, 2));
                        await handleMessage(senderPsid, messagingEvent.message);
                    } else if (messagingEvent.postback) {
                        console.log('Received postback event:', JSON.stringify(messagingEvent.postback, null, 2));
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
        console.log('Invalid object type');
        return res.sendStatus(404); // Not Found
    }
};

// Xử lý tin nhắn
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
    console.log(`Sending response to PSID ${senderPsid}:`, JSON.stringify(response, null, 2));
    await callSendAPI(senderPsid, response);
};

// Xử lý postback
const handlePostback = async (senderPsid, postback) => {
    const response = {
        text: "Postback nhận được!"
    };
    console.log(`Sending postback response to PSID ${senderPsid}:`, JSON.stringify(response, null, 2));
    await callSendAPI(senderPsid, response);
};

// Gửi API
const callSendAPI = async (senderPsid, response) => {
    try {
        const res = await axios.post(`https://graph.facebook.com/v12.0/me/messages`, {
            recipient: {
                id: senderPsid
            },
            message: response
        }, {
            params: {
                access_token: PAGE_ACCESS_TOKEN
            }
        });
        console.log('Message sent!', res.data);
    } catch (error) {
        console.error('Unable to send message:', error);
    }
};

export { getHomePage, getWebhook, postWebhook };
