import { Events } from './core.js';

export class EditorEvents extends Events {

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