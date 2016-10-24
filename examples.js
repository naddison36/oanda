var Oanda = require('oanda').default;

var oneMinuteAgo = new Date();

oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

// Either pass your API access tocken and account id as parameters to the examples.js file. eg
// node examples.js your-access-token accountId
//
// Or enter them below.
// WARNING never commit your API access token or account id into a public repository.
var accessToken = process.argv[2] || 'your-access-token';
var accountId = process.argv[3] || 'your-account-id';

var oandaClient = new Oanda(accessToken, "practice");

// uncomment the API you want to test.
// Be sure to check the parameters so you don't do any unwanted live trades

// oandaClient.getInstruments(accountId, console.log);
// oandaClient.getInstruments(accountId, console.log, ["AUD_USD","USD_CNH"], ["displayName","precision,pip,marginRate"]);

//oandaClient.getPrices(["AUD_USD","USD_CNH"], console.log);
//oandaClient.getPrices(["AUD_USD","USD_CNH"], console.log, oneMinuteAgo);

// oandaClient.getCandles("AUD_USD", console.log);
//oandaClient.getCandles("AUD_USD", console.log, {
//    start: new Date(2015, 1, 1, 16),
//    end: new Date(2015, 3, 1, 16),
//    granularity: 'D',    // day
//    alignmentTimezone: 'Australia/Sydney',
//    dailyAlignment: 16,  // start time of candle is 4pm
//    candleFormat: 'midpoint'
//});

// oandaClient.getAccounts(console.log);

// oandaClient.getAccountInfo(accountId, console.log);

// oandaClient.getOpenPositions(accountId, console.log);

// oandaClient.createMarketOrder(accountId, 'AUD_USD', 'buy', 100, console.log);
// oandaClient.createMarketOrder(accountId, 'AUD_USD', 'sell', 33, console.log);