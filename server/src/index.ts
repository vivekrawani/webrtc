import { WebSocket, WebSocketServer } from 'ws';
import { CREATE_ANSWER, CREATE_OFFER, ICE_CANDIDATE, RECEIVER, SENDER } from './constansts';


const wss = new WebSocketServer({ port: 8080 });
let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', (ws) => {
    ws.on('message', (data: any) => {
        const message = JSON.parse(data);
        console.log(message);
        switch (message.type) {
            case RECEIVER:
                receiverSocket = ws;
                break;
            case SENDER:
                senderSocket = ws;
                break;
            case CREATE_ANSWER:
                if (ws !== receiverSocket) {
                    return;
                }
                senderSocket?.send(JSON.stringify({ type: CREATE_ANSWER, sdp: message.sdp }));
                break;
            case CREATE_OFFER:
                if (ws !== senderSocket) {
                    return;
                }
                receiverSocket?.send(JSON.stringify({ type: CREATE_OFFER, sdp: message.sdp }));

                break;
            case ICE_CANDIDATE:
                if(ws === senderSocket) {
                    receiverSocket?.send(JSON.stringify({ type: ICE_CANDIDATE, candidate: message.candidate }));
                } else if (ws === receiverSocket) {
                    senderSocket?.send(JSON.stringify({ type: ICE_CANDIDATE, candidate: message.candidate }));
                }

                break;
            default:
                break;
        }
        // is sender or reciever

        /*
        now here we need 3 type of message
        1. create offer 2. create answer 3. add ice candidate
        */
        // console.log(msg)
    })
})
/*
let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === 'sender') {
      senderSocket = ws;
    } else if (message.type === 'receiver') {
      receiverSocket = ws;
    } else if (message.type === 'createOffer') {
      if (ws !== senderSocket) {
        return;
      }
      receiverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
    } else if (message.type === 'createAnswer') {
        if (ws !== receiverSocket) {
          return;
        }
        senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
    } else if (message.type === 'iceCandidate') {
      if (ws === senderSocket) {
        receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      } else if (ws === receiverSocket) {
        senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      }
    }
  });
});

*/