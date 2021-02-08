function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { listenWindow } from './utils.js';
export class Drag {
  constructor(el, onTranslate = (_x, _y, _e) => {}, onStart = _e => {}, onDrag = _e => {}) {
    _defineProperty(this, "pointerStart", null);

    _defineProperty(this, "el", null);

    _defineProperty(this, "destroy", () => {
      return;
    });

    this.pointerStart = null;
    this.el = el;
    this.el.style.touchAction = 'none';
    this.el.addEventListener('pointerdown', this.down.bind(this));
    const destroyMove = listenWindow('pointermove', this.move.bind(this));
    const destroyUp = listenWindow('pointerup', this.up.bind(this));

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
    let [x, y] = [e.pageX, e.pageY];
    let delta = [x - this.pointerStart[0], y - this.pointerStart[1]];
    let zoom = this.el.getBoundingClientRect().width / this.el.offsetWidth;
    this.onTranslate(delta[0] / zoom, delta[1] / zoom, e);
  }

  up(e) {
    if (!this.pointerStart) return;
    this.pointerStart = null;
    this.onDrag(e);
  }

}
//# sourceMappingURL=drag.js.map