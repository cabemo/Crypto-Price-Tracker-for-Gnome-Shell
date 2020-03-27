'use strict';
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Binance = Me.imports.api.binance;

const PopupMenu = imports.ui.popupMenu;
var CoinItem = GObject.registerClass(
    class CoinItem extends PopupMenu.PopupSwitchMenuItem {
        _init(symbol, text, active) {
            super._init(text, active, { style_class: 'coinItem' });

            this.text = text;
            this.symbol = symbol;
            this.activeCoin = active;
            this.timeOutTage;

            if (active) this._activeCoin();
            this._startTimer();

            this.connect('toggled', this.toggleCoin.bind(this));
            Me.imports.extension.addCoin(this);
        }
        _activeCoin() {
            let menuItem = Me.imports.extension.menuItem;

            menuItem.text = this.text + ' ...';
            this.activeCoin = true;
        }
        _getPrice() {
            return Binance.getCoin(this.symbol);
        }

        _startTimer() {
            let menuItem = Me.imports.extension.menuItem;
        
            this._refreshPrice(menuItem);

            this.timeOutTag = GLib.timeout_add(1, 1000 * 10, async () => {
                this._refreshPrice(menuItem);
                return true;
            });
        }
        async _refreshPrice(menuItem) {
            log('refreshing');
            let result = await this._getPrice();
            const jsonRes = JSON.parse(result.body);
            let price = jsonRes.price;
            let priceParts = price.split('.');

            const totalLen = 6;
            let len = 0;
            len += priceParts[0].length;
            price = priceParts[0] + '.';
            let i = 0;
            for (len; len < totalLen; len++) {
                price += priceParts[1][i];
                i++;
            }

            if (this.activeCoin) menuItem.text = `${this.text} ${price}`;
            this.label.text = `${this.text}   ${price}     `;
        }

        toggleCoin() {
            if (this.state) {
                this._activeCoin.bind(this)();
                this.disableOtherCoins();
            }
        }

        removeTimer() {
            if (this.timeOutTag) GLib.Source.remove(this.timeOutTag);
        }

        disableOtherCoins() {
            for (const coin of Me.imports.extension.indicator.coins) {
                if (coin == this) continue;
                if (coin.state) {
                    coin.toggle();
                    coin.activeCoin = false;
                }
            }
        }
    }
);
