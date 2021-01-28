import { Drag } from './drag.js';
import { Emitter } from '../core.js';
import { Zoom } from './zoom.js';


export class Area extends Emitter {

    el;
    container;
    transform = { k: 1, x: 0, y: 0 };
    mouse = { x: 0, y: 0 }

    _startPosition = null
    _zoom;
    _drag;

    constructor(container, emitter) {
        super(emitter);

        const el = this.el = document.createElement('div');

        this.container = container;
        el.style.transformOrigin = '0 0';

        this._zoom = new Zoom(container, el, 0.1, this.onZoom.bind(this));
        this._drag = new Drag(container, this.onTranslate.bind(this), this.onStart.bind(this));

        emitter.on('destroy', () => {
            this._zoom.destroy();
            this._drag.destroy();
        });

        this.container.addEventListener('pointermove', this.pointermove.bind(this));

        this.update();
    }

    update() {
        const t = this.transform;

        this.el.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.k})`;
    }

    pointermove(e) {
        const { clientX, clientY } = e;
        const rect = this.el.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const k = this.transform.k;

        this.mouse = { x: x / k, y: y / k };
        this.trigger('mousemove', { ...this.mouse }); // TODO rename on `pointermove`
    }

    onStart() {
        this._startPosition = { ...this.transform };
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
        const params = { transform: this.transform, x, y };

        if (!this.trigger('translate', params)) return;

        this.transform.x = params.x;
        this.transform.y = params.y;

        this.update();
        this.trigger('translated');
    }

    zoom(zoom, ox = 0, oy = 0, sourceSource) {
        const k = this.transform.k;
        const params = { transform: this.transform, zoom, source };

        if (!this.trigger('zoom', params)) return;

        const d = (k - params.zoom) / ((k - zoom) || 1);

        this.transform.k = params.zoom || 1;
        this.transform.x += ox * d;
        this.transform.y += oy * d;

        this.update();
        this.trigger('zoomed', { source });
    }

    appendChild(el) {
        this.el.appendChild(el)
    }

    removeChild(el) {
        this.el.removeChild(el)
    }
}