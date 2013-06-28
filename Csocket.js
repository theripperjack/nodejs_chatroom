
module.exports = {
    listen: function(app, cookie, connect) {
        var io = require('socket.io').listen(app);
        var clients = {};
        var amount = 0;

        io.set('authorization', function (handshakeData, accept) {
            if (handshakeData.headers.cookie) {
                handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
                handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'nexdoor');

                if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
                    return accept('Cookie is invalid.', false);
                }

            } else {
                return accept('No cookie transmitted.', false);
            }


            accept(null, true);
        });



        var talk = io.of('/im');
        var user_data = {name : 'Guest'};

        talk.on('connection', function (socket) {

            amount++;
            clients[socket.id] = {name:"Guest" + amount};
            talk.emit('client connect', { name: clients[socket.id].name });

            // console.log(Object.keys(clients).length);
            // console.log(clients);
            

            socket.on('client', function (data) {
              talk.emit('server', {msg:data.msg, name:clients[socket.id].name });
            })
            .on('r_name', function(data){
                var o_name = clients[socket.id].name;
                clients[socket.id].name = data.name;
                talk.emit('server', {msg:o_name + ' change name to ' + clients[socket.id].name, type:true});

            })
            .on('disconnect', function(data) {
                talk.emit('client disconnect', { name: clients[socket.id].name });

                delete clients[socket.id];
                amount--;
            });

        })
        .on('disconnect', function() {
            console.log('disconnect');
        });

    }
};

