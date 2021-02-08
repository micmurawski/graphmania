"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selected = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Selected {
  constructor() {
    _defineProperty(this, "list", []);
  }

  add(item) {
    var accumulate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!accumulate) this.list = [item];else if (!this.contains(item)) this.list.push(item);
  }

  clear() {
    this.list = [];
  }

  remove(item) {
    this.list.splice(this.list.indexOf(item), 1);
  }

  contains(item) {
    return this.list.indexOf(item) !== -1;
  }

  each(callback) {
    this.list.forEach(callback);
  }

}

exports.Selected = Selected;
//# sourceMappingURL=selected.js.map