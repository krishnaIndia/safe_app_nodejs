const EventEmitter = require('events').EventEmitter;
const autoref = require('./helpers').autoref;
const api = require('./api');
const lib = require('./native/lib');

class SAFEApp extends EventEmitter {
  // internal wrapper
  constructor(appInfo) { // -> SAFEApp
    super();
    this._appInfo = appInfo;
    this._networkState = 'init';
    this._connection = null;
    Object.getOwnPropertyNames(api).forEach((key) => {
      this[key] = new api[key](this);
    });
  }

  webFetch(url) {
    return Promise.reject(new Error('Not Implemented'));
  }

  set connection(con) {
    if (this._connection) {
      lib.free_app(this._connection);
    }
    this._connection = con;
  }

  get connection() {
    if (!this._connection) throw Error("Setup Incomplete. Connection not available yet.");
    return this._connection;
  }

  get app() {
    return this.connection;
  }

  get networkState() {
    return this._networkState;
  }

  get appInfo() {
    return this._appInfo;
  }

  static fromAuthUri(appInfo, authUri) {
    const app = autoref(new SAFEApp(appInfo));
    return app.auth.loginFromURI(authUri);
  }

  _networkStateUpdated(uData, error, newState) {
    // FIXME: we need to map the state to strings
    this.emit('network-state-updated', newState, this._networkState);
    this.emit(`network-state-${newState}`, this._networkState);
    this._networkState = newState;
  }

  static free(app) {
    // we are freed last, anything you do after this
    // will probably fail.
    lib.free_app(app.connection);

    // in the hopes, this all cleans up,
    // before we do in a matter of seconds from now
  }

}
module.exports = SAFEApp;
