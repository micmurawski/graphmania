function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { ControlView } from './control.js';
import { Drag } from './drag.js';
import { Emitter } from '../core.js';
import { SocketView } from './socket.js';
export class NodeView extends Emitter {
  constructor(node, component, emitter) {
    super(emitter);

    _defineProperty(this, "node", void 0);

    _defineProperty(this, "component", void 0);

    _defineProperty(this, "sockets", new Map());

    _defineProperty(this, "controls", new Map());

    _defineProperty(this, "el", void 0);

    _defineProperty(this, "_startPosition", []);

    _defineProperty(this, "_drag", void 0);

    this.node = node;
    this.component = component;
    this.el = document.createElement('div');
    this.el.style.position = 'absolute';
    this.el.addEventListener('contextmenu', e => this.trigger('contextmenu', {
      e,
      node: this.node
    }));
    this._drag = new Drag(this.el, this.onTranslate.bind(this), this.onSelect.bind(this), () => {
      this.trigger('nodedraged', node);
      this.trigger('nodedragged', node);
    });
    this.trigger('rendernode', {
      el: this.el,
      node,
      component: component.data,
      bindSocket: this.bindSocket.bind(this),
      bindControl: this.bindControl.bind(this)
    });
    this.update();
  }

  clearSockets() {
    const ios = [...this.node.inputs.values(), ...this.node.outputs.values()];
    this.sockets.forEach(s => {
      if (!ios.includes(s.io)) this.sockets.delete(s.io);
    });
  }

  bindSocket(el, type, io) {
    this.clearSockets();
    this.sockets.set(io, new SocketView(el, type, io, this.node, this));
  }

  bindControl(el, control) {
    this.controls.set(control, new ControlView(el, control, this));
  }

  getSocketPosition(io) {
    const socket = this.sockets.get(io);
    if (!socket) throw new Error(`Socket not found for ${io.name} with key ${io.key}`);
    return socket.getPosition(this.node);
  }

  onSelect(e) {
    const payload = {
      node: this.node,
      accumulate: e.ctrlKey,
      e
    };
    this.onStart();
    this.trigger('multiselectnode', payload);
    this.trigger('selectnode', payload);
  }

  onStart() {
    this._startPosition = [...this.node.position];
  }

  onTranslate(dx, dy) {
    this.trigger('translatenode', {
      node: this.node,
      dx,
      dy
    });
  }

  onDrag(dx, dy) {
    const x = this._startPosition[0] + dx;
    const y = this._startPosition[1] + dy;
    this.translate(x, y);
  }

  translate(x, y) {
    const node = this.node;
    const params = {
      node,
      x,
      y
    };
    if (!this.trigger('nodetranslate', params)) return;
    const [px, py] = node.position;
    const prev = [px, py];
    node.position[0] = params.x;
    node.position[1] = params.y;
    this.update();
    this.trigger('nodetranslated', {
      node,
      prev
    });
  }

  update() {
    const [x, y] = this.node.position;
    this.el.style.transform = `translate(${x}px, ${y}px)`;
  }

  remove() {}

  destroy() {
    this._drag.destroy();
  }

}
//# sourceMappingURL=node.js.map