var http = require("http");
var port = process.env.PORT || 8080;
var server = http.createServer();
server.on("request", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello World\n");
});
server.listen(port);
console.log('Server running at http://127.0.0.1:' + port + "/");
