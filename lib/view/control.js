"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ControlView = void 0;

var _core = require("../core.js");

class ControlView extends _core.Emitter {
  constructor(el, control, emitter) {
    super(emitter);
    this.trigger('rendercontrol', {
      el,
      control
    });
  }

}

exports.ControlView = ControlView;
//# sourceMappingURL=control.js.map