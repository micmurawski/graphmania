"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Socket = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Socket {
  constructor(name) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _defineProperty(this, "name", void 0);

    _defineProperty(this, "data", void 0);

    _defineProperty(this, "compatible", []);

    this.name = name;
    this.data = data;
    this.compatible = [];
  }

  combineWith(socket) {
    this.compatible.push(socket);
  }

  compatibleWith(socket) {
    return this === socket || this.compatible.includes(socket);
  }

}

exports.Socket = Socket;
//# sourceMappingURL=socket.js.map