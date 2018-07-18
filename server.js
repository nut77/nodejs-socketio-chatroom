const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const favicon = require('serve-favicon');

const app = express();
const server = http.createServer(app); // <==> const server = app.listen(2000);
server.listen(2000);

app.use(favicon(__dirname + '/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.get('/index', (req, res) => {

   res.sendfile(__dirname + '/views/index.html');
});

const io = socketIo.listen(server);
var users = []; // 用户列表
io.sockets.on('connection', socket => {

    socket.on('disconnect', () => {

        console.log(`服务端：客户端断开连接。`);
    });

    // 自定义事件
    socket.on('login', user => {

        if (-1 != users.indexOf(user)) {

            socket.emit('duplicateUser');
            return false;
        }

        users.push(user);
        io.sockets.emit('login', user);
        io.sockets.emit('chgUserlist', users);
    });

    socket.on('chat', data => {

        io.sockets.emit('chat', data);
    });

    socket.on('exit', user => {

        users.splice(users.indexOf(user), 1);
        socket.broadcast.emit('exit', user);
        socket.broadcast.emit('chgUserlist', users);
    });
});
