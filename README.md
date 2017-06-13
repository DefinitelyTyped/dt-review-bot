# dt-review-bot

BOT for DefinitelyTyped

## How to contribute

If you want to improve review comments, please send a pull request to [dt-review-tool](https://github.com/DefinitelyTyped/dt-review-tool).

## How to deploy

This bot uses GoogleAppEngine ManagedVM.
But this bot is not dependent on the appengine API. 

```
$ npm run deploy
```

## How to setup

This bot needs a personal access token. https://github.com/settings/tokens

```
$ ls token.json
ls: token.json: No such file or directory
$ npm run auth
...
$ ls -la token.json
-rw-r--r--@ 1 vvakame  staff  866 11  9 10:47 token.json
```
