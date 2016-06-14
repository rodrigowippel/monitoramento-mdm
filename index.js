var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/app'));
app.use('/css', express.static(__dirname + '/app/css'));
app.use('/img', express.static(__dirname + '/app/images'));

app.use('/js', express.static(__dirname + '/app/js'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/app/view/index.html");
});

app.listen(app.get('port'), function() {
    console.log('Painel de monitoramento MDM disponível em', app.get('port'));
});
