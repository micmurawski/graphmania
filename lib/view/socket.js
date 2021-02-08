"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SocketView = void 0;

var _core = require("../core.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class SocketView extends _core.Emitter {
  constructor(el, type, io, node, emitter) {
    super(emitter);

    _defineProperty(this, "el", void 0);

    _defineProperty(this, "type", void 0);

    _defineProperty(this, "io", void 0);

    _defineProperty(this, "node", void 0);

    this.el = el;
    this.type = type;
    this.io = io;
    this.node = node;
    this.trigger('rendersocket', {
      el,
      [type]: this.io,
      socket: io.socket
    });
  }

  getPosition(_ref) {
    var {
      position
    } = _ref;
    var el = this.el;
    return [position[0] + el.offsetLeft + el.offsetWidth / 2, position[1] + el.offsetTop + el.offsetHeight / 2];
  }

}

exports.SocketView = SocketView;
//# sourceMappingURL=socket.js.map