"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Engine = exports.Recursion = exports.EngineEvents = exports.Component = exports.State = void 0;

var _core = require("./core.js");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var State = {
  AVAILABLE: 0,
  PROCESSED: 1,
  ABORT: 2
};
exports.State = State;

function intersect(array1, array2) {
  return array1.filter(value => -1 !== array2.indexOf(value));
}

class Component {
  constructor(name) {
    _defineProperty(this, "data", {});

    _defineProperty(this, "engine", null);

    this.name = name;
  }

  worker(node, inputs, outputs) {
    return;
  }

}

exports.Component = Component;

class EngineEvents extends _core.Events {
  constructor() {
    super({});
  }

}

exports.EngineEvents = EngineEvents;

class Recursion {
  constructor(nodes) {
    this.nodes = nodes;
  }

  extractInputNodes(node) {
    return Object.keys(node.inputs).reduce((acc, key) => {
      var {
        connections
      } = node.inputs[key];
      var nodesData = (connections || []).reduce((b, c) => {
        return [...b, this.nodes[c.node]];
      }, []);
      return [...acc, ...nodesData];
    }, []);
  }

  findSelf(list, inputNodes) {
    var inters = intersect(list, inputNodes);
    if (inters.length) return inters[0];

    for (var node of inputNodes) {
      var l = [node, ...list];
      var inter = this.findSelf(l, this.extractInputNodes(node));
      if (inter) return inter;
    }

    return null;
  }

  detect() {
    var nodesArr = Object.keys(this.nodes).map(id => this.nodes[id]);

    for (var node of nodesArr) {
      var inters = this.findSelf([node], this.extractInputNodes(node));
      if (inters) return inters;
    }

    return null;
  }

}

exports.Recursion = Recursion;

class Engine extends _core.Context {
  constructor(id) {
    super(id, new EngineEvents());

    _defineProperty(this, "args", []);

    _defineProperty(this, "data", null);

    _defineProperty(this, "state", State.AVAILABLE);

    _defineProperty(this, "onAbort", () => {});
  }

  clone() {
    var engine = new Engine(this.id);
    this.components.forEach(c => engine.register(c));
    return engine;
  }

  throwError(message) {
    var _arguments = arguments,
        _this = this;

    return _asyncToGenerator(function* () {
      var data = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : null;
      yield _this.abort();

      _this.trigger('error', {
        message,
        data
      });

      _this.processDone();

      return 'error';
    })();
  }

  processStart() {
    if (this.state === State.AVAILABLE) {
      this.state = State.PROCESSED;
      return true;
    }

    if (this.state === State.ABORT) {
      return false;
    }

    console.warn("The process is busy and has not been restarted.\n                Use abort() to force it to complete");
    return false;
  }

  processDone() {
    var success = this.state !== State.ABORT;
    this.state = State.AVAILABLE;

    if (!success) {
      this.onAbort();

      this.onAbort = () => {};
    }

    return success;
  }

  abort() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return new Promise(ret => {
        if (_this2.state === State.PROCESSED) {
          _this2.state = State.ABORT;
          _this2.onAbort = ret;
        } else if (_this2.state === State.ABORT) {
          _this2.onAbort();

          _this2.onAbort = ret;
        } else ret();
      });
    })();
  }

  lock(node) {
    return _asyncToGenerator(function* () {
      return new Promise(res => {
        node.unlockPool = node.unlockPool || [];
        if (node.busy && !node.outputData) node.unlockPool.push(res);else res();
        node.busy = true;
      });
    })();
  }

  unlock(node) {
    node.unlockPool.forEach(a => a());
    node.unlockPool = [];
    node.busy = false;
  }

  extractInputData(node) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      var obj = {};

      for (var key of Object.keys(node.inputs)) {
        var input = node.inputs[key];
        var conns = input.connections;
        var connData = yield Promise.all(conns.map( /*#__PURE__*/function () {
          var _ref = _asyncToGenerator(function* (c) {
            var prevNode = _this3.data.nodes[c.node];
            var outputs = yield _this3.processNode(prevNode);
            if (!outputs) _this3.abort();else return outputs[c.output];
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }()));
        obj[key] = connData;
      }

      return obj;
    })();
  }

  processWorker(node) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      var inputData = yield _this4.extractInputData(node);

      var component = _this4.components.get(node.name);

      var outputData = {};

      try {
        yield component.worker(node, inputData, outputData, ..._this4.args);
      } catch (e) {
        _this4.abort();

        _this4.trigger('warn', e);
      }

      return outputData;
    })();
  }

  processNode(node) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (_this5.state === State.ABORT || !node) return null;
      yield _this5.lock(node);

      if (!node.outputData) {
        node.outputData = yield _this5.processWorker(node);
      }

      _this5.unlock(node);

      return node.outputData;
    })();
  }

  forwardProcess(node) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      if (_this6.state === State.ABORT) return null;
      return yield Promise.all(Object.keys(node.outputs).map( /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator(function* (key) {
          var output = node.outputs[key];
          return yield Promise.all(output.connections.map( /*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(function* (c) {
              var nextNode = _this6.data.nodes[c.node];
              yield _this6.processNode(nextNode);
              yield _this6.forwardProcess(nextNode);
            });

            return function (_x3) {
              return _ref3.apply(this, arguments);
            };
          }()));
        });

        return function (_x2) {
          return _ref2.apply(this, arguments);
        };
      }()));
    })();
  }

  copy(data) {
    data = Object.assign({}, data);
    data.nodes = Object.assign({}, data.nodes);
    Object.keys(data.nodes).forEach(key => {
      data.nodes[key] = Object.assign({}, data.nodes[key]);
    });
    return data;
  }

  validate(data) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      var checking = _core.Validator.validate(_this7.id, data);

      var recursion = new Recursion(data.nodes);
      if (!checking.success) return yield _this7.throwError(checking.msg);
      var recurrentNode = recursion.detect();
      if (recurrentNode) return yield _this7.throwError('Recursion detected', recurrentNode);
      return true;
    })();
  }

  processStartNode(id) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      if (!id) return;
      var startNode = _this8.data.nodes[id];
      if (!startNode) return yield _this8.throwError('Node with such id not found');
      yield _this8.processNode(startNode);
      yield _this8.forwardProcess(startNode);
    })();
  }

  processUnreachable() {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      var data = _this9.data;

      for (var i in data.nodes) {
        // process nodes that have not been reached
        var node = data.nodes[i];

        if (typeof node.outputData === 'undefined') {
          yield _this9.processNode(node);
          yield _this9.forwardProcess(node);
        }
      }
    })();
  }

  process(data) {
    var _arguments2 = arguments,
        _this10 = this;

    return _asyncToGenerator(function* () {
      var startId = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : null;
      if (!_this10.processStart()) return;
      if (!_this10.validate(data)) return;
      _this10.data = _this10.copy(data);

      for (var _len = _arguments2.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = _arguments2[_key];
      }

      _this10.args = args;
      yield _this10.processStartNode(startId);
      yield _this10.processUnreachable();
      return _this10.processDone() ? 'success' : 'aborted';
    })();
  }

}

exports.Engine = Engine;
//# sourceMappingURL=engine.js.map