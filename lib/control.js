"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Control = void 0;

var _node = require("./node.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Control {
  constructor(key) {
    _defineProperty(this, "key", void 0);

    _defineProperty(this, "data", {});

    _defineProperty(this, "parent", null);

    if (this.constructor === Control) throw new TypeError('Can not construct abstract class');
    if (!key) throw new Error('The key parameter is missing in super() of Control ');
    this.key = key;
  }

  getNode() {
    if (this.parent === null) throw new Error('Control isn\'t added to Node/Input');
    if (this.parent instanceof _node.Node) return this.parent;
    if (!this.parent.node) throw new Error('Control hasn\'t be added to Input or Node');
    return this.parent.node;
  }

  getData(key) {
    return this.getNode().data[key];
  }

  putData(key, data) {
    this.getNode().data[key] = data;
  }

}

exports.Control = Control;
//# sourceMappingURL=control.js.map