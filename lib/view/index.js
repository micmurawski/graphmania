"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditorView = void 0;

var _area = require("./area.js");

var _connection = require("./connection.js");

var _core = require("../core.js");

var _node = require("./node.js");

var _utils = require("./utils.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class EditorView extends _core.Emitter {
  constructor(container, components, emitter) {
    super(emitter);

    _defineProperty(this, "container", void 0);

    _defineProperty(this, "components", void 0);

    _defineProperty(this, "nodes", new Map());

    _defineProperty(this, "connections", new Map());

    _defineProperty(this, "area", void 0);

    this.container = container;
    this.components = components;
    this.container.style.overflow = 'hidden';
    this.container.addEventListener('click', this.click.bind(this));
    this.container.addEventListener('contextmenu', e => this.trigger('contextmenu', {
      e,
      view: this
    }));
    emitter.on('destroy', (0, _utils.listenWindow)('resize', this.resize.bind(this)));
    emitter.on('destroy', () => this.nodes.forEach(view => view.destroy()));
    this.on('nodetranslated', this.updateConnections.bind(this));
    this.area = new _area.Area(container, this);
    this.container.appendChild(this.area.el);
  }

  addNode(node) {
    var component = this.components.get(node.name);
    if (!component) throw new Error("Component ".concat(node.name, " not found"));
    var nodeView = new _node.NodeView(node, component, this);
    this.nodes.set(node, nodeView);
    this.area.appendChild(nodeView.el);
  }

  removeNode(node) {
    var nodeView = this.nodes.get(node);
    this.nodes.delete(node);

    if (nodeView) {
      this.area.removeChild(nodeView.el);
      nodeView.destroy();
    }
  }

  addConnection(connection) {
    if (!connection.input.node || !connection.output.node) throw new Error('Connection input or output not added to node');
    var viewInput = this.nodes.get(connection.input.node);
    var viewOutput = this.nodes.get(connection.output.node);
    if (!viewInput || !viewOutput) throw new Error('View node not found for input or output');
    var connView = new _connection.ConnectionView(connection, viewInput, viewOutput, this);
    this.connections.set(connection, connView);
    this.area.appendChild(connView.el);
  }

  removeConnection(connection) {
    var connView = this.connections.get(connection);
    this.connections.delete(connection);
    if (connView) this.area.removeChild(connView.el);
  }

  updateConnections(_ref) {
    var {
      node
    } = _ref;
    node.getConnections().forEach(conn => {
      var connView = this.connections.get(conn);
      if (!connView) throw new Error('Connection view not found');
      connView.update();
    });
  }

  resize() {
    var {
      container
    } = this;
    if (!container.parentElement) throw new Error('Container doesn\'t have parent element');
    var width = container.parentElement.clientWidth;
    var height = container.parentElement.clientHeight;
    container.style.width = width + 'px';
    container.style.height = height + 'px';
  }

  click(e) {
    var container = this.container;
    if (container !== e.target) return;
    if (!this.trigger('click', {
      e,
      container
    })) return;
  }

}

exports.EditorView = EditorView;
//# sourceMappingURL=index.js.map