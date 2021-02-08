"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeView = void 0;

var _control = require("./control.js");

var _drag = require("./drag.js");

var _core = require("../core.js");

var _socket = require("./socket.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class NodeView extends _core.Emitter {
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
    this._drag = new _drag.Drag(this.el, this.onTranslate.bind(this), this.onSelect.bind(this), () => {
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
    var ios = [...this.node.inputs.values(), ...this.node.outputs.values()];
    this.sockets.forEach(s => {
      if (!ios.includes(s.io)) this.sockets.delete(s.io);
    });
  }

  bindSocket(el, type, io) {
    this.clearSockets();
    this.sockets.set(io, new _socket.SocketView(el, type, io, this.node, this));
  }

  bindControl(el, control) {
    this.controls.set(control, new _control.ControlView(el, control, this));
  }

  getSocketPosition(io) {
    var socket = this.sockets.get(io);
    if (!socket) throw new Error("Socket not found for ".concat(io.name, " with key ").concat(io.key));
    return socket.getPosition(this.node);
  }

  onSelect(e) {
    var payload = {
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
    var x = this._startPosition[0] + dx;
    var y = this._startPosition[1] + dy;
    this.translate(x, y);
  }

  translate(x, y) {
    var node = this.node;
    var params = {
      node,
      x,
      y
    };
    if (!this.trigger('nodetranslate', params)) return;
    var [px, py] = node.position;
    var prev = [px, py];
    node.position[0] = params.x;
    node.position[1] = params.y;
    this.update();
    this.trigger('nodetranslated', {
      node,
      prev
    });
  }

  update() {
    var [x, y] = this.node.position;
    this.el.style.transform = "translate(".concat(x, "px, ").concat(y, "px)");
  }

  remove() {}

  destroy() {
    this._drag.destroy();
  }

}

exports.NodeView = NodeView;
//# sourceMappingURL=node.js.map