"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeEditor = void 0;

var _core = require("./core.js");

var _events = require("./events.js");

var _node = require("./node.js");

var _selected = require("./selected.js");

var _index = require("./view/index.js");

var _utils = require("./view/utils.js");

var _component = require("./component.js");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class NodeEditor extends _core.Context {
  constructor(id, container) {
    super(id, new _events.EditorEvents());

    _defineProperty(this, "nodes", []);

    _defineProperty(this, "selected", new _selected.Selected());

    _defineProperty(this, "view", void 0);

    this.view = new _index.EditorView(container, this.components, this);
    this.on('destroy', (0, _utils.listenWindow)('keydown', e => this.trigger('keydown', e)));
    this.on('destroy', (0, _utils.listenWindow)('keyup', e => this.trigger('keyup', e)));
    this.on('selectnode', (_ref) => {
      var {
        node,
        accumulate
      } = _ref;
      return this.selectNode(node, accumulate);
    });
    this.on('nodeselected', () => this.selected.each(n => {
      var nodeView = this.view.nodes.get(n);
      nodeView && nodeView.onStart();
    }));
    this.on('translatenode', (_ref2) => {
      var {
        dx,
        dy
      } = _ref2;
      return this.selected.each(n => {
        var nodeView = this.view.nodes.get(n);
        nodeView && nodeView.onDrag(dx, dy);
      });
    });
  }

  addNode(node) {
    if (!this.trigger('nodecreate', node)) return;
    this.nodes.push(node);
    this.view.addNode(node);
    this.trigger('nodecreated', node);
  }

  removeNode(node) {
    if (!this.trigger('noderemove', node)) return;
    node.getConnections().forEach(c => this.removeConnection(c));
    this.nodes.splice(this.nodes.indexOf(node), 1);
    this.view.removeNode(node);
    this.trigger('noderemoved', node);
  }

  connect(output, input) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (!this.trigger('connectioncreate', {
      output,
      input
    })) return;

    try {
      var connection = output.connectTo(input);
      connection.data = data;
      this.view.addConnection(connection);
      this.trigger('connectioncreated', connection);
    } catch (e) {
      this.trigger('warn', e);
    }
  }

  removeConnection(connection) {
    if (!this.trigger('connectionremove', connection)) return;
    this.view.removeConnection(connection);
    connection.remove();
    this.trigger('connectionremoved', connection);
  }

  selectNode(node) {
    var accumulate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (this.nodes.indexOf(node) === -1) throw new Error('Node not exist in list');
    if (!this.trigger('nodeselect', node)) return;
    this.selected.add(node, accumulate);
    this.trigger('nodeselected', node);
  }

  getComponent(name) {
    var component = this.components.get(name);
    if (!component) throw "Component ".concat(name, " not found");
    return component;
  }

  register(component) {
    super.register(component);
    component.editor = this;
  }

  clear() {
    [...this.nodes].forEach(node => this.removeNode(node));
    this.trigger('clear');
  }

  toJSON() {
    var data = {
      id: this.id,
      nodes: {}
    };
    this.nodes.forEach(node => data.nodes[node.id] = node.toJSON());
    this.trigger('export', data);
    return data;
  }

  beforeImport(json) {
    var checking = _core.Validator.validate(this.id, json);

    if (!checking.success) {
      this.trigger('warn', checking.msg);
      return false;
    }

    this.silent = true;
    this.clear();
    this.trigger('import', json);
    return true;
  }

  afterImport() {
    this.silent = false;
    return true;
  }

  fromJSON(json) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (!_this.beforeImport(json)) return false;
      var nodes = {};

      try {
        yield Promise.all(Object.keys(json.nodes).map( /*#__PURE__*/function () {
          var _ref3 = _asyncToGenerator(function* (id) {
            var node = json.nodes[id];

            var component = _this.getComponent(node.name); //console.log(component)
            //throw new Error(component)


            nodes[id] = yield component.build(_node.Node.fromJSON(node));

            _this.addNode(nodes[id]);
          });

          return function (_x) {
            return _ref3.apply(this, arguments);
          };
        }()));
        Object.keys(json.nodes).forEach(id => {
          var jsonNode = json.nodes[id];
          var node = nodes[id];
          Object.keys(jsonNode.outputs).forEach(key => {
            var outputJson = jsonNode.outputs[key];
            outputJson.connections.forEach(jsonConnection => {
              var nodeId = jsonConnection.node;
              var data = jsonConnection.data;
              var targetOutput = node.outputs.get(key);
              var targetInput = nodes[nodeId].inputs.get(jsonConnection.input);

              if (!targetOutput || !targetInput) {
                return _this.trigger('error', "IO not found for node ".concat(node.id));
              }

              _this.connect(targetOutput, targetInput, data);
            });
          });
        });
      } catch (e) {
        _this.trigger('warn', e);

        return !_this.afterImport();
      }

      return _this.afterImport();
    })();
  }

}

exports.NodeEditor = NodeEditor;
//# sourceMappingURL=editor.js.map