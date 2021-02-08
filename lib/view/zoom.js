"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Zoom = void 0;

var _utils = require("./utils.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Zoom {
  constructor(container, el, intensity, onzoom) {
    _defineProperty(this, "el", void 0);

    _defineProperty(this, "intensity", void 0);

    _defineProperty(this, "onzoom", void 0);

    _defineProperty(this, "previous", null);

    _defineProperty(this, "pointers", []);

    _defineProperty(this, "destroy", () => {});

    this.el = el;
    this.intensity = intensity;
    this.onzoom = onzoom;
    container.addEventListener('wheel', this.wheel.bind(this));
    container.addEventListener('pointerdown', this.down.bind(this));
    container.addEventListener('dblclick', this.dblclick.bind(this));
    var destroyMove = (0, _utils.listenWindow)('pointermove', this.move.bind(this));
    var destroyUp = (0, _utils.listenWindow)('pointerup', this.end.bind(this));
    var destroyCancel = (0, _utils.listenWindow)('pointercancel', this.end.bind(this));

    this.destroy = () => {
      destroyMove();
      destroyUp();
      destroyCancel();
    };
  }

  get translating() {
    // is translating while zoom (works on multitouch)
    return this.pointers.length >= 2;
  }

  wheel(e) {
    e.preventDefault();
    var rect = this.el.getBoundingClientRect();
    var wheelDelta = e.wheelDelta;
    var delta = (wheelDelta ? wheelDelta / 120 : -e.deltaY / 3) * this.intensity;
    var ox = (rect.left - e.clientX) * delta;
    var oy = (rect.top - e.clientY) * delta;
    this.onzoom(delta, ox, oy, 'wheel');
  }

  touches() {
    var e = {
      touches: this.pointers
    };
    var [x1, y1] = [e.touches[0].clientX, e.touches[0].clientY];
    var [x2, y2] = [e.touches[1].clientX, e.touches[1].clientY];
    var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    return {
      cx: (x1 + x2) / 2,
      cy: (y1 + y2) / 2,
      distance
    };
  }

  down(e) {
    this.pointers.push(e);
  }

  move(e) {
    this.pointers = this.pointers.map(p => p.pointerId === e.pointerId ? e : p);
    if (!this.translating) return;
    var rect = this.el.getBoundingClientRect();
    var {
      cx,
      cy,
      distance
    } = this.touches();

    if (this.previous !== null) {
      var delta = distance / this.previous.distance - 1;
      var ox = (rect.left - cx) * delta;
      var oy = (rect.top - cy) * delta;
      this.onzoom(delta, ox - (this.previous.cx - cx), oy - (this.previous.cy - cy), 'touch');
    }

    this.previous = {
      cx,
      cy,
      distance
    };
  }

  end(e) {
    this.previous = null;
    this.pointers = this.pointers.filter(p => p.pointerId !== e.pointerId);
  }

  dblclick(e) {
    e.preventDefault();
    var rect = this.el.getBoundingClientRect();
    var delta = 4 * this.intensity;
    var ox = (rect.left - e.clientX) * delta;
    var oy = (rect.top - e.clientY) * delta;
    this.onzoom(delta, ox, oy, 'dblclick');
  }

}

exports.Zoom = Zoom;
//# sourceMappingURL=zoom.js.map