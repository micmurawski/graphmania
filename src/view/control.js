import { Emitter } from '../core.js';

export class ControlView extends Emitter {

    constructor(el, control, emitter) {
        super(emitter);
        this.trigger('rendercontrol', { el, control });
    }
}