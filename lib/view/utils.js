"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listenWindow = listenWindow;

function listenWindow(event, handler) {
  window.addEventListener(event, handler);
  return () => {
    window.removeEventListener(event, handler);
  };
}
//# sourceMappingURL=utils.js.map