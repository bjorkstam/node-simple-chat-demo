var http = require('http'),  
    io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 
    sys = require('sys')
    
server = http.createServer(function(req, res){ 
 res.writeHead(200, {'Content-Type': 'text/html'}); 
 res.write('<h1>Hello world</h1>'); 
 res.end(); 
});
server.listen(8080);

// Add some string function(s) to use later
String.prototype.startsWith = function(str) { 
    return (this.match("^"+str)==str)
}

// socket.io 
var socket = io.listen(server, {'timeout': 60000})
var clients = []
var nick = new Object()

// Broadcasts a message to all clients connected
function broadcast_msg(msg) {
    clients.forEach(function(client) {
        client.send(msg)
    })
}
// Broadcasts a list of all connected clients
function broadcast_clients() {
    var tmp_client = []
    clients.forEach(function(client) {
        if (client.connected)
            tmp_client.push(nick[client.sessionId])
    })
    broadcast_msg({'sender': 'server', 'msg': {'clients': tmp_client }})
}
// Not yet implemented
/*
function ping_clients() {
    broadcast_msg({'sender': server, 'msg': 'ping'})
}
*/

socket.on('connection', function(client){ 
  // new client connected: 

  clients.push(client)
  nick[client.sessionId] = 'Anonymous'
  
  broadcast_msg({'sender': 'server', 'msg': nick[client.sessionId] + " connected"})
  broadcast_clients()

  client.on('message', function(msg){
      
      // /name changes nickname of the user
      if (msg.startsWith('/name')) {
          var new_name = msg.substr(msg.indexOf(' ')+1, msg.length-msg.indexOf(' ')-1)
          if (new_name == 'server')
            return
          broadcast_msg({'sender': 'server', 'msg': nick[client.sessionId] + " changed name to " + new_name})
          nick[client.sessionId] = new_name
          broadcast_clients()
      } else {
        broadcast_msg({'sender': nick[client.sessionId], 'msg': msg})
      }}) 
  client.on('disconnect', function() {
      broadcast_msg({'sender': 'server', 'msg': nick[client.sessionId] + " disconnected"})
      broadcast_clients()
  }) 
})
