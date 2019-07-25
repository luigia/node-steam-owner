# Node Steam Owner
Automatically accept trade offers sent from a single Steam ID

[![Issues](https://img.shields.io/codeclimate/issues/luigia/node-steam-owner)](https://github.com/luigia/node-steam-owner/issues)
[![Size](https://img.shields.io/github/size/luigia/node-steam-owner/owner-bot.js)](https://github.com/luigia/node-steam-owner/blob/master/owner-bot.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/luigia/node-steam-owner/blob/master/LICENSE)

Written in Node.js to solve the problem of having to manually go back and forth between multiple Steam accounts to move items. The bot will accept any trade offer sent by a specified Steam user, accept gift offers and decline those that don't offer any items.

### Configuration 
- username: Steam username
- password: Steam password
- steamName: Desired Steam name (optional)
- owner: Steam64 ID to accept offers from
- identitySecret: Steam identity secret (retrievable from Steam Desktop Authenticator)
- sharedsecret: Steam shared secret (retrievable from Steam Desktop Authenticator)
- gameId: Desired game to be idled (app IDs available at SteamDB)

## Usage

0. Ensure [Node.js](https://nodejs.org/en/) is installed
1. Clone the repository
2. Edit config.js 
3. Run `npm i` to install the dependencies (or run `npm i steam-user steamcommunity steam-totp steam-tradeoffer-manager fs`)
4. Run `node owner-bot.js`
5. The bot will now accept incoming offers from the specified Steam64 ID
