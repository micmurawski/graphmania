"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Area = void 0;

var _drag = require("./drag.js");

var _core = require("../core.js");

var _zoom = require("./zoom.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Area extends _core.Emitter {
  constructor(container, emitter) {
    super(emitter);

    _defineProperty(this, "el", void 0);

    _defineProperty(this, "container", void 0);

    _defineProperty(this, "transform", {
      k: 1,
      x: 0,
      y: 0
    });

    _defineProperty(this, "mouse", {
      x: 0,
      y: 0
    });

    _defineProperty(this, "_startPosition", null);

    _defineProperty(this, "_zoom", void 0);

    _defineProperty(this, "_drag", void 0);

    var el = this.el = document.createElement('div');
    this.container = container;
    el.style.transformOrigin = '0 0';
    this._zoom = new _zoom.Zoom(container, el, 0.1, this.onZoom.bind(this));
    this._drag = new _drag.Drag(container, this.onTranslate.bind(this), this.onStart.bind(this));
    emitter.on('destroy', () => {
      this._zoom.destroy();

      this._drag.destroy();
    });
    this.container.addEventListener('pointermove', this.pointermove.bind(this));
    this.update();
  }

  update() {
    var t = this.transform;
    this.el.style.transform = "translate(".concat(t.x, "px, ").concat(t.y, "px) scale(").concat(t.k, ")");
  }

  pointermove(e) {
    var {
      clientX,
      clientY
    } = e;
    var rect = this.el.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    var k = this.transform.k;
    this.mouse = {
      x: x / k,
      y: y / k
    };
    this.trigger('mousemove', _objectSpread({}, this.mouse)); // TODO rename on `pointermove`
  }

  onStart() {
    this._startPosition = _objectSpread({}, this.transform);
  }

  onTranslate(dx, dy) {
    if (this._zoom.translating) return; // lock translation while zoom on multitouch

    if (this._startPosition) this.translate(this._startPosition.x + dx, this._startPosition.y + dy);
  }

  onZoom(delta, ox, oy, sourceSource) {
    this.zoom(this.transform.k * (1 + delta), ox, oy, source);
    this.update();
  }

  translate(x, y) {
    var params = {
      transform: this.transform,
      x,
      y
    };
    if (!this.trigger('translate', params)) return;
    this.transform.x = params.x;
    this.transform.y = params.y;
    this.update();
    this.trigger('translated');
  }

  zoom(zoom) {
    var ox = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var oy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var sourceSource = arguments.length > 3 ? arguments[3] : undefined;
    var k = this.transform.k;
    var params = {
      transform: this.transform,
      zoom,
      source
    };
    if (!this.trigger('zoom', params)) return;
    var d = (k - params.zoom) / (k - zoom || 1);
    this.transform.k = params.zoom || 1;
    this.transform.x += ox * d;
    this.transform.y += oy * d;
    this.update();
    this.trigger('zoomed', {
      source
    });
  }

  appendChild(el) {
    this.el.appendChild(el);
  }

  removeChild(el) {
    this.el.removeChild(el);
  }

}

exports.Area = Area;
//# sourceMappingURL=area.js.map