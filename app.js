var express = require('express');
var app = express();
session = require('express-session');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var util = require('util');
var bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));

var hash = bcrypt.hashSync("contraseña");
console.log('contraseña de usuario encriptada: ${hash}');
var users = {
  usuario : hash,
  fer : bcrypt.hashSync("ferpassword"),
  amy : bcrypt.hashSync("amyspassword")
};

app.use(cookieParser());
app.use(session({
  secret: '2C44-4D44-WppQ38S',
  resave: true,
  saveUninitialized: true
}));

app.use(function(req, res, next) {
  console.log("Cookies :  "+util.inspect(req.cookies));
  console.log("session :  "+util.inspect(req.session));
  next();
});

app.get('/', (req, res)=>{
  res.redirect('/login');
})

app.get('/login', (req, res)=>{
  res.render('login');
});

app.post('/login', (req, res)=>{
  console.log(req.query);
  if(!req.body.username || !req.body.password){
    console.log('login failed');
    res.send('login failed');
  } else if(req.body.username in users &&
            bcrypt.compareSync(req.body.password, users[req.body.username])){
              req.session.user = req.body.username;
              req.session.admin = true;
              res.send("login exitoso! usuario: "+req.session.user);
            }else {
              console.log('login ${util.inspect(req.query)} fallido');
              res.send("No has podido loguear.");
            }
});

var auth = function(req, res, next) {
  if (req.session && req.session.user in users)
    return next();
  else
    return res.sendStatus(401);
};

//app.get('/content/*?', auth); //Se pasará al siguiente middleware solo si estamos autenticados.

app.use( "/content", [ auth, express.static( __dirname + "/public" ) ] );

app.get('/logout', (req, res)=>{
  req.session.destroy();
  res.send("logout exitoso!");
});



var server = app.listen(process.env.PORT || 3000, ()=>{
  var host = server.address().address;
  var port = server.address().port;

  console.log('Servidor escuchando en: http://%s:%s', host, port);
});
