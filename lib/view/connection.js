"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionView = void 0;

var _core = require("../core.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ConnectionView extends _core.Emitter {
  constructor(connection, inputNode, outputNode, emitter) {
    super(emitter);

    _defineProperty(this, "connection", void 0);

    _defineProperty(this, "inputNode", void 0);

    _defineProperty(this, "outputNode", void 0);

    _defineProperty(this, "el", void 0);

    this.connection = connection;
    this.inputNode = inputNode;
    this.outputNode = outputNode;
    this.el = document.createElement('div');
    this.el.style.position = 'absolute';
    this.el.style.zIndex = '-1';
    this.trigger('renderconnection', {
      el: this.el,
      connection: this.connection,
      points: this.getPoints()
    });
  }

  getPoints() {
    var [x1, y1] = this.outputNode.getSocketPosition(this.connection.output);
    var [x2, y2] = this.inputNode.getSocketPosition(this.connection.input);
    return [x1, y1, x2, y2];
  }

  update() {
    this.trigger('updateconnection', {
      el: this.el,
      connection: this.connection,
      points: this.getPoints()
    });
  }

}

exports.ConnectionView = ConnectionView;
//# sourceMappingURL=connection.js.map