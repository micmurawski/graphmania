"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = void 0;

var _engine = require("./engine.js");

var _node = require("./node.js");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Component extends _engine.Component {
  constructor(name) {
    super(name);

    _defineProperty(this, "editor", null);

    _defineProperty(this, "data", {});
  }

  builder(node) {
    return _asyncToGenerator(function* () {
      return;
    })();
  }

  build(node) {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield _this.builder(node);
      return node;
    })();
  }

  createNode() {
    var _arguments = arguments,
        _this2 = this;

    return _asyncToGenerator(function* () {
      var data = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
      var node = new _node.Node(_this2.name);
      node.data = data;
      yield _this2.build(node);
      return node;
    })();
  }

}

exports.Component = Component;
//# sourceMappingURL=component.js.map