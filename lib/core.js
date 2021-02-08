"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Context = exports.Validator = exports.Events = exports.Emitter = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Emitter {
  constructor(events) {
    _defineProperty(this, "events", {});

    _defineProperty(this, "silent", false);

    this.events = events instanceof Emitter ? events.events : events.handlers;
  }

  on(names, hanlder) {
    var events = names instanceof Array ? names : names.split(' ');
    events.forEach(name => {
      if (!this.events[name]) throw new Error('The event ${name} does not exist');
      this.events[name].push(hanlder);
    });
  }

  trigger(name) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!(name in this.events)) throw new Error("The event ".concat(name, " cannot be triggered"));
    return this.events[name].reduce((r, e) => {
      return e(params) !== false && r;
    }, true);
  }

  bind(name) {
    if (this.events[name]) throw new Error("The event ".concat(name, " is already bound"));
    this.events[name] = [];
  }

  exist(name) {
    return Array.isArray(this.events[name]);
  }

}

exports.Emitter = Emitter;

class Events {
  constructor() {
    var handlers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _defineProperty(this, "handlers", {});

    this.handlers = _objectSpread({
      warn: [console.warn],
      error: [console.error],
      componentregister: [],
      destroy: []
    }, handlers);
  }

}

exports.Events = Events;

class Validator {
  static isValidData(data) {
    return typeof data.id === 'string' && this.isValidId(data.id) && data.nodes instanceof Object && !(data.nodes instanceof Array);
  }

  static isValidId(id) {
    return /^[\w-]{3,}@[0-9]+\.[0-9]+\.[0-9]+$/.test(id);
  }

  static validate(id, data) {
    var id1 = id.split('@');
    var id2 = data.id.split('@');
    var msg = [];
    if (!this.isValidData(data)) msg.push('Data is not suitable');
    if (id !== data.id) msg.push('IDs not equal');
    if (id1[0] !== id2[0]) msg.push('Names don\'t match');
    if (id1[1] !== id2[1]) msg.push('Versions don\'t match');
    return {
      success: Boolean(!msg.length),
      msg: msg.join('. ')
    };
  }

}

exports.Validator = Validator;

class Context extends Emitter {
  constructor(id, events) {
    super(events);

    if (!Validator.isValidId(id)) {
      throw new Error('ID should be valid to name@0.1.0 format');
    }

    this.id = id;
    this.plugins = new Map();
    this.components = new Map();
  }

  use(plugin, options) {
    if (plugin.name && this.plugins.has(plugin.name)) throw new Error("Plugin ".concat(plugin.name, " already in use"));
    plugin.install(this, options || {});
    this.plugins.set(plugin.name, options);
  }

  register(component) {
    if (this.components.has(component.name)) throw new Error("Component ".concat(component.name, " already registered"));
    this.components.set(component.name, component);
    this.trigger('componentregister', component);
  }

  destroy() {
    this.trigger('destroy');
  }

}

exports.Context = Context;
//# sourceMappingURL=core.js.map