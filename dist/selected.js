function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

export class Selected {
  constructor() {
    _defineProperty(this, "list", []);
  }

  add(item, accumulate = false) {
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
//# sourceMappingURL=selected.js.map