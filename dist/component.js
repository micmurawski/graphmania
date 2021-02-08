function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Component as ComponentWorker } from './engine.js';
import { Node } from './node.js';
export class Component extends ComponentWorker {
  constructor(name) {
    super(name);

    _defineProperty(this, "editor", null);

    _defineProperty(this, "data", {});
  }

  async builder(node) {
    return;
  }

  async build(node) {
    await this.builder(node);
    return node;
  }

  async createNode(data = {}) {
    const node = new Node(this.name);
    node.data = data;
    await this.build(node);
    return node;
  }

}
//# sourceMappingURL=component.js.map