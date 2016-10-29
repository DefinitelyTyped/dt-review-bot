import * as http from "http";
import * as review from "dt-review-tool";

/* tslint:disable:no-require-imports */
import Client = require("github");
/* tslint:enable:no-require-imports */

let auth: { token: string; } = require("./token.json");

export function defaultHandler(_req: http.ServerRequest, res: http.ServerResponse) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, world\n");
}

export function stopHandler(_req: http.ServerRequest, res: http.ServerResponse) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("instance will be stop\n");
    process.exit();
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

export function githubEventHandler(req: http.ServerRequest, res: http.ServerResponse) {
    let githubEvent: string = req.headers["X-GitHub-Event".toLowerCase()] || "'???'";

    let requestBody = "";
    req.on("data", (chunk: any) => {
        requestBody += chunk.toString();
    });
    req.on("end", () => {
        console.log(`status:${githubEvent}\n${requestBody}`);

        switch (githubEvent) {
            case "pull_request":
                let payload: PullRequestOpened = JSON.parse(requestBody);
                if (payload.action === "opened") {
                    githubPullRequestOpenedHandler(req, res, payload);
                    return;
                }

                githubMiscHandler(req, res, githubEvent, requestBody);
                return;

            default:
                githubMiscHandler(req, res, githubEvent, requestBody);
                return;
        }
    });
}

export function githubEventHandlerForCloudFunctions(req: any, res: http.ServerResponse) {
    let githubEvent: string = req.get("X-GitHub-Event") || "'???'";
    let requestBody = JSON.stringify(req.body, null, 2);
    console.log(`status:${githubEvent}`);

    switch (githubEvent) {
        case "pull_request":
            let payload: PullRequestOpened = req.body;
            if (payload.action === "opened") {
                console.log(payload.pull_request.html_url);
                githubPullRequestOpenedHandler(req, res, payload);
                return;
            }
            break;

        default:
            break;
    }

    githubMiscHandler(req, res, githubEvent, requestBody);
}

function githubMiscHandler(_req: http.ServerRequest, res: http.ServerResponse, githubEvent: string, requestBody: string) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`status:${githubEvent}\n${requestBody}`);
}

function githubPullRequestOpenedHandler(_req: http.ServerRequest, res: http.ServerResponse, payload: PullRequestOpened) {
    review
        .generateComment({
            owner: payload.repository.owner.login,
            repo: payload.repository.name,
            number: payload.number,
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
                }, (err: any, _res: any) => {
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
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end(JSON.stringify(e, null, 2));
        });
}

