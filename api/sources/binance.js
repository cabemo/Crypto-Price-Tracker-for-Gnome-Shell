const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
import request from './api/request.js';

var BinanceClient = {
  async _getPrice(name, vol) {
    try {
      const url = 'https://api.binance.com/api/v3/ticker/price?symbol=';
      const res = await request.get(url + name + vol);

      const jsonRes = JSON.parse(res.body);
      if (jsonRes.code) return jsonRes.msg.slice(0, 30) + '...';

      return +jsonRes.price;
    } catch (error) {
      console.debug(error);
    }
  },

  _getChartUrl(symbol) {
    let exchangeUrl = 'https://www.binance.com/en/trade';
    let formattedPair = symbol.replace('/', '_').toUpperCase();

    return _('%s/%s').format(exchangeUrl, formattedPair);
  }
}