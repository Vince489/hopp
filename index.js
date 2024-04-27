const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Handle socket events here
});

app.get('/', (req, res) => {
  res.render('index');
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});