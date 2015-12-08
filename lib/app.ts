"use strict";

import * as http from "http";
import * as review from "dt-review-tool";

/* tslint:disable:no-require-imports */
import Client = require("github");
/* tslint:enable:no-require-imports */

let auth: { token: string; } = require("../token");

let port = process.env.PORT || 8080;
let server = http.createServer();
server.on("request", (req: http.ServerRequest, res: http.ServerResponse) => {
    if (req.url === "/_ah/health" || req.url === "/_ah/start") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("ok");
        return;
    }
    if (req.url === "/_ah/stop") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("ok");
        process.exit();
        return;
    }
    if (req.url !== "/github/receive") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Hello World\n");
        return;
    }
    let githubEvent: string = req.headers["X-GitHub-Event".toLowerCase()];

    let requestBody = "";
    req.on("data", (chunk: any) => {
        requestBody += chunk.toString();
    });
    req.on("end", () => {
        switch (githubEvent) {
            case "pull_request":
                let payload: PullRequestOpened = JSON.parse(requestBody);
                if (payload.action === "opened") {
                    handlePullRequestOpened(req, res, payload);
                    return;
                }
            // fall through

            default:
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("Hello World\nstatus:" + githubEvent + "\n" + requestBody);
                break;
        }
    });
});
server.listen(port);
console.log(`Server running at http://127.0.0.1:${port}/`);

function handlePullRequestOpened(req: http.ServerRequest, res: http.ServerResponse, payload: PullRequestOpened) {
    review
        .generateComment({
            user: payload.repository.owner.login,
            repo: payload.repository.name,
            number: payload.number
        })
        .then(comments => {
            res.write(comments.join("\n------\n\n"));
            let github = new Client({
                version: "3.0.0"
            });
            github.authenticate({
                type: "oauth",
                token: auth.token
            });
            return new Promise<void>((resolve, reject) => {
                github.issues.createComment({
                    user: payload.repository.owner.login,
                    repo: payload.repository.name,
                    number: payload.number,
                    body: comments.join("\n------\n\n")
                }, (err: any, res: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        })
        .then(() => {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end();
        }, e => {
            res.writeHead(401, { "Content-Type": "text/plain" });
            res.end(JSON.stringify(e, null, 2));
        });
}

interface PullRequestOpened {
    action: string;
    number: number;
    pull_request: any;
    repository: {
        full_name: string;
        name: string;
        owner: {
            login: string;
        };
    };
}
