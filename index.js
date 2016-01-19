var util = require('util'),
    _ = require('underscore'),
    request	= require('request'),
    VError = require('verror');

var OANDA = function OANDA(accessToken, environment, timeout)
{
    this.accessToken = accessToken;
    this.environment = environment || 'practice';

    this.timeout = timeout || 30000;

    this.servers = {
        sandbox: "https://api-sandbox.oanda.com",
        practice: "https://api-fxpractice.oanda.com",
        live: "https://api-fxtrade.oanda.com"
    };
};

OANDA.prototype.request = function(method, path, params, data, callback)
{
    var functionName = 'OANDA.request()',
        self = this,
        error;

    if(!this.accessToken)
    {
        error = new VError('%s must provide access token to make this API request.', functionName);
        return callback(error);
    }

    if ( !_.isFunction(callback) )
    {
        error = new VError('%s forth parameter needs to be a callback function', functionName);
        return error;
    }

    var headers = {
        "User-Agent": "Javascript client for OANDA REST API",
        'Authorization': 'Bearer ' + this.accessToken
    };

    var url = this.servers[this.environment] + path;

    var options = {
        url: url,
        method: method,
        headers: headers,
        qs: params,
        json: data
    };

    var requestDesc = util.format('%s request to url %s with params %s',
        method, url, JSON.stringify(params));

    request(options, function(err, response, data)
    {
        var error = null;

        if (err)
        {
            error = new VError(err, '%s failed %s', functionName, requestDesc);
            error.name = err.code;
        }
        else if (_.has(data, 'message'))
        {
            error = new VError('%s API returned error code %s from %s. Error message: %s', functionName,
                data.code, requestDesc, data.message);
            error.name = data.message;
        }
        else if (response.statusCode < 200 || response.statusCode >= 300)
        {
            error = new VError('%s HTTP status code %s returned from %s.', functionName,
                response.statusCode, requestDesc);
            error.name = response.statusCode;
        }
        // if request was not able to parse json response into an object
        else if (!_.isObject(data) )
        {
            error = new VError('%s could not parse response from %s\nResponse: %s', functionName, requestDesc, data);
            error.name = data;
        }

        callback(error, data);
    });
};


OANDA.prototype.getInstruments = function getInstruments(accountId, callback, instruments, fields)
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
};

OANDA.prototype.getPrices = function getPrices(instruments, callback, since)
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
};

OANDA.prototype.getPrice = function getPrices(instrument, callback, since)
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
};

OANDA.prototype.getCandles = function getCandles(instrument, callback, options)
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
};

OANDA.prototype.getAccounts = function getAccounts(callback)
{
    this.request(
        "GET",
        "/v1/accounts",
        {},
        {},
        callback);
};

OANDA.prototype.getAccountInfo = function getAccountInfo(accountId, callback)
{
    this.request(
        "GET",
        "/v1/accounts/" + accountId,
        {},
        {},
        callback);
};

OANDA.prototype.getOpenPositions = function getOpenPositions(accountId, callback)
{
    this.request(
        "GET",
        "/v1/accounts/" + accountId + "/positions",
        {},
        {},
        callback);
};

module.exports = OANDA;