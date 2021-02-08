function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Emitter } from '../core.js';
export class ConnectionView extends Emitter {
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
    const [x1, y1] = this.outputNode.getSocketPosition(this.connection.output);
    const [x2, y2] = this.inputNode.getSocketPosition(this.connection.input);
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
//# sourceMappingURL=connection.js.map