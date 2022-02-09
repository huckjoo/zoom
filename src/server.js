import http from 'http';
import Websocket, { createWebSocketStream } from 'ws';
import express from 'express';

const app = express();
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);
app.use('/public', express.static(`${__dirname}/public`));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);
const wss = new Websocket.Server({ server });

const sockets = [];

// on은 event 발생 기다림, socket을 전달하는데 socket은 서버(나)와 브라우저의 연결
wss.on('connection', (socket) => {
  sockets.push(socket);
  socket['nickname'] = 'Anon';
  console.log('Connected to Server ✅'); // 브라우저가 연결되면 무언가 console.log
  socket.on('close', () => console.log('Disconnected to the Browser ❌')); // 브라우저가 꺼지면 console.log
  socket.on('message', (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case 'new_message':
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`),
        );
      case 'nickname':
        socket['nickname'] = message.payload;
    }
  });
});

server.listen(3000, handleListen);
