# dt-review-bot

BOT for DefinitelyTyped

## How to contribute

If you want to improve review comment, please send pull request to [dt-review-tool](https://github.com/DefinitelyTyped/dt-review-tool).

## How to deploy

This bot uses GoogleAppEngine ManagedVM.
but this bot is not depeneds on appengine API. 

```
$ npm run deploy
```

## How to setup

This bot needs personal access token. https://github.com/settings/tokens

```
$ ls token.json
ls: token.json: No such file or directory
$ npm run auth
...
$ ls -la token.json
-rw-r--r--@ 1 vvakame  staff  866 11  9 10:47 token.json
```
