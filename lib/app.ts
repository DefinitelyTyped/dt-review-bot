"use strict";

import * as http from "http";

let port = process.env.PORT || 8080;
let server = http.createServer();
server.on("request", (req: http.ServerRequest, res: http.ServerResponse) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
});
server.listen(port);
console.log(`Server running at http://127.0.0.1:${port}/`);
