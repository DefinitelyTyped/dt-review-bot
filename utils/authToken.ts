import * as readline from "readline";
import * as fs from "fs";

/* tslint:disable:no-require-imports */
import Client = require("github");
/* tslint:enable:no-require-imports */

let github = new Client({
    version: "3.0.0"
    // debug: true
});

getBasicAuthInfo()
    .then(info => {
        github.authenticate({
            type: "basic",
            username: info.user,
            password: info.password
        });
        let authCreateReq: github.AuthorizationCreateMessage = {
            scopes: ["public_repo"],
            note: "dt review bot",
            client_id: "6dfc3629feef934dadd0",
            client_secret: "7524eed1afd84b09f08f1439e7e08860add37c09"
        };
        if (info.twofa) {
            authCreateReq.headers = {
                "X-GitHub-OTP": info.twofa
            };
        }

        github.authorization.create(authCreateReq, (err: any, res: any) => {
            if (err) {
                console.error(err);
                console.log();
                console.log("already_exists? check https://github.com/settings/tokens and delete 'dt review bot'");
                return;
            }
            fs.writeFileSync("token.json", JSON.stringify(res, null, 2));
            console.log(res);
        });
    });

interface BasicAuthInfo {
    user: string;
    password: string;
    twofa?: string;
}

function getBasicAuthInfo(): Promise<BasicAuthInfo> {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return Promise.resolve({} as any as BasicAuthInfo)
        .then(result => {
            return question("user: ").then(v => result.user = v).then(() => result);
        })
        .then(result => {
            return question("password: ").then(v => result.password = v).then(() => result);
        })
        .then(result => {
            return question("2fa code: ").then(v => result.twofa = v).then(() => result);
        })
        .then(result => {
            rl.close();
            return result;
        });

    function question(q: string) {
        return new Promise<string>((resolve, _reject) => {
            rl.question(q, (line: string) => {
                resolve(line);
            });
        });
    }
}
