"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Drag = void 0;

var _utils = require("./utils.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Drag {
  constructor(el) {
    var onTranslate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (_x, _y, _e) => {};
    var onStart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _e => {};
    var onDrag = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _e => {};

    _defineProperty(this, "pointerStart", null);

    _defineProperty(this, "el", null);

    _defineProperty(this, "destroy", () => {
      return;
    });

    this.pointerStart = null;
    this.el = el;
    this.el.style.touchAction = 'none';
    this.el.addEventListener('pointerdown', this.down.bind(this));
    var destroyMove = (0, _utils.listenWindow)('pointermove', this.move.bind(this));
    var destroyUp = (0, _utils.listenWindow)('pointerup', this.up.bind(this));

    this.destroy = () => {
      destroyMove();
      destroyUp();
    };
  }

  down(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    this.pointerStart = [e.pageX, e.pageY];
    this.onStart(e);
  }

  move(e) {
    if (!this.pointerStart) return;
    e.preventDefault();
    var [x, y] = [e.pageX, e.pageY];
    var delta = [x - this.pointerStart[0], y - this.pointerStart[1]];
    var zoom = this.el.getBoundingClientRect().width / this.el.offsetWidth;
    this.onTranslate(delta[0] / zoom, delta[1] / zoom, e);
  }

  up(e) {
    if (!this.pointerStart) return;
    this.pointerStart = null;
    this.onDrag(e);
  }

}

exports.Drag = Drag;
//# sourceMappingURL=drag.js.map