function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

export class Socket {
  constructor(name, data = {}) {
    _defineProperty(this, "name", void 0);

    _defineProperty(this, "data", void 0);

    _defineProperty(this, "compatible", []);

    this.name = name;
    this.data = data;
    this.compatible = [];
  }

  combineWith(socket) {
    this.compatible.push(socket);
  }

  compatibleWith(socket) {
    return this === socket || this.compatible.includes(socket);
  }

}
//# sourceMappingURL=socket.js.map