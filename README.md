Node.js wrapper to OANDA's REST API
===============

A node.js wrapper for [OANDA's](http://www.oanda.com/) [REST](http://developer.oanda.com/rest-live/introduction/) API.
You will need a registered OANDA account for the API to work. You can sign up for a account [here](https://register.oanda.com/#/sign-up).

### Install

`npm install oanda`

### Design Principles
- **thin** the client is just a simple wrapper to the OANDA REST API. There is no parameter validation as this is delegated to the API server. Similarly, there is no data transformation.
- **errors** all errors are returned as detailed Error objects which can be used programatically or logged for support
- **no retries** it's up to the calling program to handle retries as it'll vary between programs. For example, error handling timeouts on mutable API calls like addOrder and cancelOrder is not as simple as retying the API call as the operation my have been successful on the exchange but the response back was not.

### Error handling
The first parameter to each API function is a callback function which is passed error and data objects.

The error object is an instance of [VError](https://github.com/davepacheco/node-verror) which is an extension of the standard Error object.
The three main properties are:
- **message** a description of the error with all the available information so problems in production can be diagnosed. For example the url, http request method, parameters, error codes and messages
- **name** the HTTP or [OANDA error code](http://developer.oanda.com/rest-live/troubleshooting-errors/) so specific errors can be programatically detected. For example, 503 if you are sending too many requests per second or 10010 if there is not enough funds to add a trade
- **cause** the underlying error object. eg the error object from a failed request or json parse. Note there will be no cause error for OKCoin errors

### Examples
To run an example API call in the examples.js file you will need to either
- pass your access token and accountId as parameters to the examples.js file
`node examples.js your-access-token your-account-id`

- Or enter the access token and accountId into the examples.js file
** WARNING never commit your API access token or account id into a public repository. **
```var accessToken = process.argv[2] || 'your-access-token';
var accountId = process.argv[3] || 'your-account-id';```

For safety all the api calls in the examples.js file a commented out. Please uncomment the API call you want to test and then run either
`node examples.js`
or
`node examples.js your-access-token your-account-id`
To run an example you will need to 
