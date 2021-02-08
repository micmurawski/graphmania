"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditorEvents = void 0;

var _core = require("./core.js");

class EditorEvents extends _core.Events {
  constructor() {
    super({
      nodecreate: [],
      nodecreated: [],
      noderemove: [],
      noderemoved: [],
      connectioncreate: [],
      connectioncreated: [],
      connectionremove: [],
      connectionremoved: [],
      translatenode: [],
      nodetranslate: [],
      nodetranslated: [],
      nodedraged: [],
      nodedragged: [],
      selectnode: [],
      multiselectnode: [],
      nodeselect: [],
      nodeselected: [],
      rendernode: [],
      rendersocket: [],
      rendercontrol: [],
      renderconnection: [],
      updateconnection: [],
      keydown: [],
      keyup: [],
      translate: [],
      translated: [],
      zoom: [],
      zoomed: [],
      click: [],
      mousemove: [],
      contextmenu: [],
      import: [],
      export: [],
      process: [],
      clear: []
    });
  }

}

exports.EditorEvents = EditorEvents;
//# sourceMappingURL=events.js.map