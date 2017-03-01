/**
 * Created by MatiMaster on 3/1/2017
 */
var CHAT_PORT = 8080;
var MINIMUM_USERNAME_LENGTH = 3;


var app = require('express')();
var bodyParser = require("body-parser");
var http = require('http').createServer(app);
var io1 = require('socket.io')(http); // require returns io object, ioObj(http)
var io = io1.of('/Chat');
var UUID = require('node-uuid');


var pageConnectionLogging = true;

var connectedUsers = {};

//setup middleware for parsing forms
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// now body parser has access to the req, res, and next of the gets and posts methods of app



function getHomePage(request,response){
    if(pageConnectionLogging){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/index.html');
}


app.get('/', getHomePage);
app.get( '/*' , function( req, res, next ) {
    //This is the current file they have requested
    var file = req.params[0];
    //For debugging, we can track what files are requested.
    if(pageConnectionLogging) console.log('\t :: Express :: file requested : ' + file);
    //Send the requesting client the file.
    res.sendFile( __dirname + '/' + file );

});

app.post('/Chat', function(req, res){
  var userName = req.body.usernameInputBox;
    if(userName.length >= MINIMUM_USERNAME_LENGTH){
        connectedUsers[req.ip] = userName; // store the ip address as key and username as value.
        res.sendfile("Templates/Chat.html");
    }else{
        res.sendfile("index.html");
    }
}
);

io.on('connection', function(client) {
    client.userName = connectedUsers[client.handshake.address];
    console.log('Socket.io:: ' + client.userName + ' connected');
    // let the user know he succesfully connected
    client.emit('connected', {userName: client.userName});
    //let everyone else know that someone has connected
    client.broadcast.emit('someoneConnected', {userName: client.userName});


    client.on('sendMessage', function(data){
         io.emit('messageReceive', {sender: client.userName, msg: data.theMsg});
    });

    client.on('disconnect', function(){
        console.log('Socket.io:: ' + client.userName + ' disconnected');
        delete connectedUsers[client.handshakeAddress];
    });

});


http.listen(process.env.PORT|| CHAT_PORT, function(){
    console.log('Listening on port ' + CHAT_PORT);
    console.log(http.address());
});









