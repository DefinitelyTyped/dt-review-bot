import * as http from "http";

import * as h from "./handlers";

let port = process.env.PORT || 8080;
let server = http.createServer();
server.on("request", (req: http.ServerRequest, res: http.ServerResponse) => {
    if (req.url === "/_ah/health" || req.url === "/_ah/start") {
        h.defaultHandler(req, res);
        return;
    }
    if (req.url === "/_ah/stop") {
        h.stopHandler(req, res);
        return;
    }
    if (req.url === "/github/receive") {
        h.githubEventHandler(req, res);
        return;
    }

    h.defaultHandler(req, res);
});
server.listen(port);
console.log(`Server running at http://127.0.0.1:${port}/`);
