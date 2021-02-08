function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

export class Node {
  constructor(name) {
    _defineProperty(this, "name", void 0);

    _defineProperty(this, "id", void 0);

    _defineProperty(this, "position", [0.0, 0.0]);

    _defineProperty(this, "inputs", new Map());

    _defineProperty(this, "outputs", new Map());

    _defineProperty(this, "controls", new Map());

    _defineProperty(this, "data", {});

    _defineProperty(this, "meta", {});

    this.name = name;
    this.id = Node.incrementId();
  }

  _add(list, item, prop) {
    if (list.has(item.key)) throw new Error(`Item with key '${item.key}' already been added to the node`);
    if (item[prop] !== null) throw new Error('Item has already been added to some node');
    item[prop] = this;
    list.set(item.key, item);
  }

  addControl(control) {
    this._add(this.controls, control, 'parent');

    return this;
  }

  removeControl(control) {
    control.parent = null;
    this.controls.delete(control.key);
  }

  addInput(input) {
    this._add(this.inputs, input, 'node');

    return this;
  }

  removeInput(input) {
    input.removeConnections();
    input.node = null;
    this.inputs.delete(input.key);
  }

  addOutput(output) {
    this._add(this.outputs, output, 'node');

    return this;
  }

  removeOutput(output) {
    output.removeConnections();
    output.node = null;
    this.outputs.delete(output.key);
  }

  getConnections() {
    const ios = [...this.inputs.values(), ...this.outputs.values()];
    const connections = ios.reduce((arr, io) => {
      return [...arr, ...io.connections];
    }, []);
    return connections;
  }

  update() {}

  static incrementId() {
    if (!this.latestId) this.latestId = 1;else this.latestId++;
    return this.latestId;
  }

  static resetId() {
    this.latestId = 0;
  }

  toJSON() {
    const reduceIO = list => {
      return Array.from(list).reduce((obj, [key, io]) => {
        obj[key] = io.toJSON();
        return obj;
      }, {});
    };

    return {
      'id': this.id,
      'data': this.data,
      'inputs': reduceIO(this.inputs),
      'outputs': reduceIO(this.outputs),
      'position': this.position,
      'name': this.name
    };
  }

  static fromJSON(json) {
    const node = new Node(json.name);
    const [x, y] = json.position;
    node.id = json.id;
    node.data = json.data;
    node.position = [x, y];
    node.name = json.name;
    Node.latestId = Math.max(node.id, Node.latestId);
    return node;
  }

}

_defineProperty(Node, "latestId", 0);
//# sourceMappingURL=node.js.map