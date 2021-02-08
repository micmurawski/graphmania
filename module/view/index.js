function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Area } from './area.js';
import { ConnectionView } from './connection.js';
import { Emitter } from '../core.js';
import { NodeView } from './node.js';
import { listenWindow } from './utils.js';
export class EditorView extends Emitter {
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
    emitter.on('destroy', listenWindow('resize', this.resize.bind(this)));
    emitter.on('destroy', () => this.nodes.forEach(view => view.destroy()));
    this.on('nodetranslated', this.updateConnections.bind(this));
    this.area = new Area(container, this);
    this.container.appendChild(this.area.el);
  }

  addNode(node) {
    const component = this.components.get(node.name);
    if (!component) throw new Error(`Component ${node.name} not found`);
    const nodeView = new NodeView(node, component, this);
    this.nodes.set(node, nodeView);
    this.area.appendChild(nodeView.el);
  }

  removeNode(node) {
    const nodeView = this.nodes.get(node);
    this.nodes.delete(node);

    if (nodeView) {
      this.area.removeChild(nodeView.el);
      nodeView.destroy();
    }
  }

  addConnection(connection) {
    if (!connection.input.node || !connection.output.node) throw new Error('Connection input or output not added to node');
    const viewInput = this.nodes.get(connection.input.node);
    const viewOutput = this.nodes.get(connection.output.node);
    if (!viewInput || !viewOutput) throw new Error('View node not found for input or output');
    const connView = new ConnectionView(connection, viewInput, viewOutput, this);
    this.connections.set(connection, connView);
    this.area.appendChild(connView.el);
  }

  removeConnection(connection) {
    const connView = this.connections.get(connection);
    this.connections.delete(connection);
    if (connView) this.area.removeChild(connView.el);
  }

  updateConnections({
    node
  }) {
    node.getConnections().forEach(conn => {
      let connView = this.connections.get(conn);
      if (!connView) throw new Error('Connection view not found');
      connView.update();
    });
  }

  resize() {
    const {
      container
    } = this;
    if (!container.parentElement) throw new Error('Container doesn\'t have parent element');
    const width = container.parentElement.clientWidth;
    const height = container.parentElement.clientHeight;
    container.style.width = width + 'px';
    container.style.height = height + 'px';
  }

  click(e) {
    const container = this.container;
    if (container !== e.target) return;
    if (!this.trigger('click', {
      e,
      container
    })) return;
  }

}
//# sourceMappingURL=index.js.map