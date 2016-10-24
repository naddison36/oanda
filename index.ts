/// <reference path="/typings/node/node-0.10.d.ts" />
/// <reference path="/typings/underscore/underscore.d.ts" />
/// <reference path="/typings/request/request.d.ts" />

import * as _ from 'underscore';
import * as request from 'request';
import {format} from 'util';
import {stringify} from "querystring";

const VError = require('verror');

type Instrument = {
    instrument: string,
    displayName: string,
    pip: string,
    maxTradeUnits: number,
    precision: number,
    maxTrailingStop: number,
    minTrailingStop: number,
    marginRate: number,
    halted: boolean,
    interestRate: string
}

type Account = {
    accountId: number,
    accountName: string,
    accountCurrency: string,
    marginRate: number
}

type AccountInfo = {
    accountId: number,
    accountName: string,
    balance: number,
    unrealizedPl: number,
    realizedPl: number,
    marginUsed: number,
    marginAvail: number,
    openTrades: number,
    openOrders: number,
    marginRate: number,
    accountCurrency: string
}

type Position = {
    instrument: string,
    units: number,
    side: string,
    avgPrice: number
}

type Price = {
    instrument: string,
    time: string,  // time in RFC3339 format
    bid: number,
    ask: number
}

type Candle = {
    time: string,  // time in RFC3339 format
    openBid?: number,
    openMid?: number,
    openAsk?: number,
    highBid?: number,
    highMid?: number,
    highAsk?: number,
    lowBid?: number,
    lowMid?: number,
    lowAsk?: number,
    closeBid?: number,
    closeMid?: number,
    closeAsk?: number,
    volume: number,
    complete: bool
}

type Candles = {
    instrument: string,
    granularity: number,
    candles: Candle[]
}

type Trade = {
    id: number,
    units: number,
    side: 'buy' | 'sell'
}

type NewOrderResponse = {
    instrument: string,
    time: string,  // time in RFC3339 format
    price: number,
    tradeOpened: {
        id: number,
        units: number,
        side: 'buy' | 'sell',
        takeProfit: number,
        stopLoss: number,
        trailingStop: number },
    tradesClosed: Trade[],
    tradeReduced: Trade
}

export default class OANDA
{
    environment: string;
    timeout: number;

    servers = {
        sandbox: "https://api-sandbox.oanda.com",
        practice: "https://api-fxpractice.oanda.com",
        live: "https://api-fxtrade.oanda.com"
    };

    constructor(public accessToken: string, environment?: string, timeout?: number)
    {
        this.environment = environment || 'practice';

        this.timeout = timeout || 30000;
    }

    request(method: string, path: string, params, data, callback: (err: Error, json?: Object)=> void): void
    {
        const functionName = 'OANDA.request()',
            self = this;

        if(!this.accessToken)
        {
            const error = new VError('%s must provide access token to make this API request.', functionName);
            return callback(error);
        }

        const headers = {
            "User-Agent": "Javascript client for OANDA REST API",
            'Authorization': 'Bearer ' + this.accessToken
        };

        const url = this.servers[this.environment] + path;

        const options = {
            url: url,
            method: method,
            headers: headers,
            qs: params,
            form: data
        };

        const requestDesc = format('%s request to url %s with params %s',
            method, url, JSON.stringify(params));

        request(options, function(err, response, data)
        {
            let error: Error = null,
                json: Object;

            if (err)
            {
                error = new VError(err, '%s failed %s', functionName, requestDesc);
                error.name = err.code;
            }
            else if (response.statusCode < 200 || response.statusCode >= 300)
            {
                error = new VError('%s HTTP status code %s returned from %s. Response: %s', functionName,
                    response.statusCode, requestDesc, data);
                error.name = response.statusCode;
            }

            try {
                json = JSON.parse(data);
            }
            catch (err) {
                return callback(new VError(err, '%s could not parse response from %s\nResponse: %s', functionName, requestDesc, data));
            }

            if (_.has(data, 'message'))
            {
                error = new VError('%s API returned error code %s from %s. Error message: %s', functionName,
                    data.code, requestDesc, data.message);
                error.name = data.message;
            }

            callback(error, json);
        });
    }

    getInstruments(accountId: string, callback: (err: Error, instruments?: {instruments: Instrument[]})=> void,
                   instruments: string[], fields: string[])
    {
        if ( _.isArray(instruments) )
        {
            instruments = instruments.join(",");
        }

        if ( _.isArray(fields) )
        {
            fields = fields.join(",");
        }

        this.request(
            "GET",
            "/v1/instruments",
            {
                accountId: accountId,
                instruments: instruments,
                fields: fields
            },
            {},
            callback);
    }

    getPrices(instruments: string[], callback: (err: Error, prices?: {prices: Price[]} )=> void, since: Date): void
    {
        if ( _.isArray(instruments) )
        {
            instruments = instruments.join(",");
        }

        if ( _.isDate(since) )
        {
            since = since.toISOString();
        }

        this.request(
            "GET",
            "/v1/prices",
            {
                instruments: instruments,
                since: since
            },
            {},
            callback);
    }

    getPrice(instrument: string, callback: (err: Error, price?: Price)=> void, since: Date): void
    {
        if ( _.isDate(since) )
        {
            since = since.toISOString();
        }

        this.request(
            "GET",
            "/v1/prices",
            {
                instruments: instrument,
                since: since
            },
            {},
            function(err, data)
            {
                if (err)
                {
                    return callback(err);
                }

                callback(null, data.prices[0]);
            });
    }

    getCandles(instrument: string, callback: (err: Error, candles?: Candles)=>void, options)
    {
        if (!options)
        {
            options = {};
        }

        if (options.start)
        {
            options.start = options.start.toISOString();
        }

        if (options.end)
        {
            options.end = options.end.toISOString();
        }

        options["instrument"] = instrument;

        this.request(
            "GET",
            "/v1/candles",
            options,
            {},
            callback);
    }

    getAccounts(callback: (err: Error, accounts?: {accounts: Account[]} )=>void): void
    {
        this.request(
            "GET",
            "/v1/accounts",
            {},
            {},
            callback);
    };

    getAccountInfo(accountId: string, callback: (err: Error, accountInfo?: AccountInfo)=>void)
    {
        this.request(
            "GET",
            "/v1/accounts/" + accountId,
            {},
            {},
            callback);
    };

    getOpenPositions(accountId: string, callback: (err: Error, postitions?: {positions: Position[]} )=>void)
    {
        this.request(
            "GET",
            "/v1/accounts/" + accountId + "/positions",
            {},
            {},
            callback);
    };

    createMarketOrder(accountId: string, instrument: string, side: 'sell' | 'buy', units: number, callback: (err: Error, result?: NewOrderResponse)=>void): void
    {
        this.request(
            "POST",
            "/v1/accounts/" + accountId + "/orders",
            {},
            {instrument: instrument,
                side: side,
                units: units,
                type: 'market'},
            callback);
    }
}