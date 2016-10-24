export default class OANDA {
    accessToken: string;
    environment: string;
    timeout: number;
    servers: {
        sandbox: string;
        practice: string;
        live: string;
    };
    constructor(accessToken: string, environment?: string, timeout?: number);
    request(method: string, path: string, params: any, data: any, callback: (err: Error, json?: Object) => void): void;
    getInstruments(accountId: string, callback: (err: Error) => void, instruments: string[], fields: string[]): void;
    getPrices(instruments: string[], callback: (err: Error) => void, since: Date): void;
    getPrice(instrument: string, callback: (err: Error) => void, since: Date): void;
    getCandles(instrument: string, callback: (err: Error) => void, options: any): void;
    getAccounts(callback: (err: Error) => void): void;
    getAccountInfo(accountId: string, callback: (err: Error) => void): void;
    getOpenPositions(accountId: string, callback: (err: Error) => void): void;
    createMarketOrder(accountId: string, instrument: string, side: 'sell' | 'buy', units: number, callback: (err: Error) => void): void;
}
