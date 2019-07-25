"use strict";

const config = require("./assets/config.js");
const steamUser = require("steam-user");
const steamCommunity = require("steamcommunity");
const totp = require("steam-totp");
const steamManager = require("steam-tradeoffer-manager");
const FS = require("fs");

const client = new steamUser(),
  logOnOptions = {
    accountName: config.username,
    password: config.password,
    twoFactorCode: totp.generateAuthCode(config.sharedSecret)
  };

const community = new steamCommunity(),
  manager = new steamManager({
    steam: client,
    community: community,
    domain: "localhost",
    pollInterval: 2000,
    language: "en"
  });

client.logOn(logOnOptions);

client.on("loggedOn", () => {
  client.setPersona(steamUser.EPersonaState.Online, config.steamName);
  client.gamesPlayed(config.gameId);
  console.log(`Logged in to Steam`);
});

if (FS.existsSync("assets/polldata.json")) {
  manager.pollData = JSON.parse(
    FS.readFileSync("assets/polldata.json").toString("utf8")
  );
}

client.on("webSession", (sid, cookies) => {
  manager.setCookies(cookies, err => {
    if (err) {
      console.log(err);
      process.exit(1); // couldn't get API key
      return;
    }
  });
  community.setCookies(cookies);
  community.startConfirmationChecker(20000, config.identitySecret);
});

client.on("friendRelationship", (steamid, relationship) => {
  if (relationship === 2) {
    client.addFriend(steamid);
    client.chatMessage(
      config.owner,
      `${steamid} added me to their friends list`
    );
    client.chatMessage(steamid, `Hello, thanks for adding me`);
    console.log(`${steamid} added me to their friends list`);
  }
});

manager.on("newOffer", offer => {
  console.log(
    `Received offer #${offer.id} from ${offer.partner.getSteamID64()}`
  );
  client.chatMessage(
    config.owner,
    `Received offer #${offer.id} from ${offer.partner.getSteamID64()}`
  );

  if (offer.partner.getSteamID64() === config.owner) {
    offer.accept(false, (err, status) => {
      if (err) {
        client.chatMessage(
          config.owner,
          `Couldn't accept trade offer from owner`
        );
        console.log(`Couldn't accept trade offer from owner. ${err.message}`);
      }

      client.chatMessage(config.owner, `Accepting offer from owner...`);
      console.log(`Accepting offer from owner...`);
    });
  } else if (!offer.itemsToGive.length) {
    offer.accept(false, (err, status) => {
      if (err) {
        client.chatMessage(
          config.owner,
          `Couldn't accept the gift offer from ${offer.partner.getSteamID64()}`
        );
        console.log(
          `Couldn't accept the gift offer from ${offer.partner.getSteamID64()}. Status: ${status} - ${
            err.message
          }`
        );
      }

      client.chatMessage(
        config.owner,
        `Gift offer from ${offer.partner.getSteamID64()} successfully accepted`
      );
      console.log(
        `Gift offer from ${offer.partner.getSteamID64()} successfully accepted`
      );
    });
  } else if (!offer.itemsToReceive) {
    offer.decline(err => {
      if (err) {
        client.chatMessage(
          config.owner,
          `Couldn't decline the trade from ${offer.partner.getSteamID64()}`
        );
        console.log(
          `Couldn't decline the trade offer from ${offer.partner.getSteamID64()}`
        );
      }

      client.chatMessage(
        config.owner,
        `Declined trade offer #${
          offer.id
        } from ${offer.partner.getSteamID64()} because partner did not include items`
      );
      console.log(
        `Declined offer ${
          offer.id
        } from ${offer.partner.getSteamID64()} not offering items`
      );
    });
  }
});

manager.on("receivedOfferChanged", (offer, oldState) => {
  client.chatMessage(
    config.owner,
    `Received offer #${
      offer.id
    } from ${offer.partner.getSteamID64()} is now ${steamManager.ETradeOfferState[
      offer.state
    ].toLowerCase()}`
  );
  console.log(
    `Received offer #${
      offer.id
    } from ${offer.partner.getSteamID64()} is now ${steamManager.ETradeOfferState[
      offer.state
    ].toLowerCase()}`
  );
});

manager.on("sentOfferChanged", (offer, oldState) => {
  client.chatMessage(
    config.owner,
    `Sent offer #${
      offer.id
    } from ${offer.partner.getSteamID64()} is now ${steamManager.ETradeOfferState[
      offer.state
    ].toLowerCase()})`
  );
  console.log(
    `Sent offer #${offer.id} from ${offer.partner.getSteamID64()} is now ${
      steamManager.ETradeOfferState[offer.state]
    })`
  );
});

manager.on("pollData", pollData => {
  FS.writeFileSync("assets/polldata.json", JSON.stringify(pollData));
});
