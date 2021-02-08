function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Emitter } from '../core.js';
export class SocketView extends Emitter {
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

  getPosition({
    position
  }) {
    const el = this.el;
    return [position[0] + el.offsetLeft + el.offsetWidth / 2, position[1] + el.offsetTop + el.offsetHeight / 2];
  }

}
//# sourceMappingURL=socket.js.map