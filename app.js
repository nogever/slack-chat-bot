const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const token = process.env.SLACK_TOKEN || '';
const isPhone = require('is-phone');

const rtm = new RtmClient(token, {
  logLevel: 'error',
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true,
});

let state = 'DEFAULT';
const handlers = {};
const user = {};

handlers.DEFAULT = (message) => {
  rtm.sendMessage('Welcome', message.channel);
  state = 'GET_NAME';
}

handlers.GET_NAME = (message) => {
  rtm.sendMessage('What\'s your name?', message.channel);
  state = 'GET_ADDRESS';
}

handlers.GET_ADDRESS = (message) => {
  user.name = message.text;
  rtm.sendMessage('What\'s your address?', message.channel);
  state = 'GET_PHONE';
}

handlers.GET_PHONE = (message) => {
  user.address = message.text;
  rtm.sendMessage('What\'s your phone?', message.channel);
  state = 'GET_TITLE';
}

handlers.GET_TITLE = (message) => {
  if (isPhone(message.text)) {
    user.phone = message.text;
    rtm.sendMessage('What\'s your title?', message.channel);
    state = 'CONFIRM';
  } else {
    handlers.GET_PHONE(message);
  }
}

handlers.CONFIRM = (message) => {
  user.title = message.text;
  rtm.sendMessage('Good? ' + `${user.name} ${user.address} ${user.phone} ${user.title}`, message.channel);
  state = 'DONE';
}

handlers.DONE = (message) => {
  rtm.sendMessage('Done', message.channel);
}

const router = (message) => {
  if (message.channel === 'G4R5GF4RM') {
    return;
  } else if (message.channel === 'D4UBXH9PU') {
    handlers[state](message);
  }
};

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  router(message);
});

rtm.start();
