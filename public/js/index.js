// 获取dom元素-相关方法
const getDom = {
    byId(id) {

        return document.getElementById(id);
    },
    byClass(className, isElements) {

        return isElements ? document.getElementsByClassName(className) : document.getElementsByClassName(className)[0];
    },
    byTag(tag, isElements) {

        return isElements ? document.getElementsByTagName(tag) : document.getElementsByTagName(tag)[0];
    }
};

// 格式化时间
Date.prototype.Format = function (fmt, hasweek) {

    var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));

    return fmt + (hasweek ? "&nbsp;" + weekday[this.getDay()] : "");
};

// 页面上需要用到的所有dom元素
let inputFiled = getDom.byId('user');
let textareaField = getDom.byId('msg');
let loginBtn = getDom.byId('login');
let exitBtn = getDom.byId('exit');
let sendMsgBtn = getDom.byId('sendMsg');
let msgBox = getDom.byClass('chat-msg');
let userlistBox = getDom.byClass('userlist');

// 相关变量
let socket;

// 绑定事件
loginBtn.onclick = login;
exitBtn.onclick = exit;
sendMsgBtn.onclick = sendMsg;

// 消息区新增一条消息
function addMsg(msg) {

    let ele = document.createElement('p');
    ele.innerHTML = `${(new Date()).Format('yyyy-MM-dd hh:mm:ss', true)}：${msg}`;
    msgBox.appendChild(ele);
}

// 登录-聊天
function login() {

    let user = inputFiled.value.trim();
    if ('' == user) {

        alert('用户名不能为空');
        return false;
    }

    socket = io.connect();
    socket.on('connect', () => {

        // 与聊天服务器连接
        addMsg(`与聊天服务器的连接已建立。`);
        socket.emit('login', user);

        // 登录聊天系统
        socket.on('login', user => {

            addMsg(`欢迎用户<b class="text-primary">${user}</b>进入聊天室`);
            loginBtn.disabled = true;
        });

        // 改变用户列表
        socket.on('chgUserlist', users => {

            userlistBox.removeChild('dd');
            for (let user in users) {

                let item = document.createElement('dd');
                item.innerText = user;
                userlistBox.appendChild(item);
            }
        });

        // 发送消息
        socket.on('chat', data => {

            addMsg(`${(new Date()).Format('yyyy-MM-dd hh:mm:ss', true)}：<b class="text-primary">${data.user}</b>说"${data.msg}" `);
        });

        // 断开连接
        socket.on('disconnect', user => {

            addMsg(`与聊天服务器的连接已断开。`);
            exitBtn.disabled = sendMsgBtn.disabled = loginBtn.disabled = true;
            userlistBox.removeChild('dd');
        });

        // 退出聊天
        socket.on('exit', data => {

            addMsg(`${(new Date()).Format('yyyy-MM-dd hh:mm:ss', true)}：<b class="text-primary">${data.user}</b>已退出聊天室。`);
        });

        // 重复登录用户名操作
        socket.on('duplicateUser', data => {

            alert('该用户名已被使用，修改用户名后重新登录');
            exitBtn.disabled = sendMsgBtn.disabled = true;
            loginBtn.disabled = '';
        });

        // 连接发生错误
        socket.on('error', err => {

            addMsg(`与聊天服务器的连接发生错误。`);
            socket.disconnect();
            socket.removeAllListeners('connect');
            io.sockets = {};
        });
    });
}

// 发送消息
function sendMsg() {

    let msg = textareaField.value;
    if (0 < msg.leading) {

        socket.emit('chat', {user: inputFiled.value.trim(), data: msg});
        textareaField.value = '';
    }
}

// 退出聊天系统
function exit() {

    socket.emit('exit', inputFiled.value.trim());
    socket.disconnect();
    socket.removeAllListeners('connect');
    io.sockets = {};
    addMsg(`${(new Date()).Format('yyyy-MM-dd hh:mm:ss', true)}：<b class="text-primary">${data.user}</b>已退出聊天室。`);
    exitBtn.disabled = sendMsgBtn.disabled = true;
    loginBtn.disabled = '';
    userlistBox.removeChild('dd');
}