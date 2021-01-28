export class Emitter {
    events = {};
    silent = false;

    constructor(events) {
        this.events = events instanceof Emitter ? events.events : events.handlers;

    }

    on(names, hanlder) {
        const events = names instanceof Array ? names : names.split(' ');

        events.forEach(name => {
            if (!this.events[name])
                throw new Error('The event ${name} does not exist');
            this.events[name].push(hanlder);

        });
    }

    trigger(name, params = {}) {
        if (!(name in this.events))
            throw new Error(`The event ${name} cannot be triggered`);

        return this.events[name].reduce((r, e) => {
            return (e(params) !== false) && r
        }, true);
    }

    bind(name) {
        if (this.events[name])
            throw new Error(`The event ${name} is already bound`);

        this.events[name] = [];
    }

    exist(name) {
        return Array.isArray(this.events[name]);
    }
}

export class Events {
    handlers = {};

    constructor(handlers = {}) {
        this.handlers = {
            warn: [console.warn],
            error: [console.error],
            componentregister: [],
            destroy: [],
            ...handlers
        }
    }
}


export class Validator {

    static isValidData(data) {
        return typeof data.id === 'string' &&
            this.isValidId(data.id) &&
            data.nodes instanceof Object && !(data.nodes instanceof Array);
    }

    static isValidId(id) {
        return /^[\w-]{3,}@[0-9]+\.[0-9]+\.[0-9]+$/.test(id);
    }

    static validate(id, data) {
        const id1 = id.split('@');
        const id2 = data.id.split('@');
        let msg = [];

        if (!this.isValidData(data))
            msg.push('Data is not suitable');
        if (id !== data.id)
            msg.push('IDs not equal');
        if (id1[0] !== id2[0])
            msg.push('Names don\'t match');
        if (id1[1] !== id2[1])
            msg.push('Versions don\'t match');

        return { success: Boolean(!msg.length), msg: msg.join('. ') };
    }
}


export class Context extends Emitter {
    constructor(id, events) {
        super(events);

        if (!Validator.isValidId(id)) {
            throw new Error('ID should be valid to name@0.1.0 format');
        }

        this.id = id;
        this.plugins = new Map();
        this.components = new Map();
    }

    use(plugin, options) {
        if (plugin.name && this.plugins.has(plugin.name)) throw new Error(`Plugin ${plugin.name} already in use`)

        plugin.install(this, options || {});
        this.plugins.set(plugin.name, options)
    }

    register(component) {
        if (this.components.has(component.name))
            throw new Error(`Component ${component.name} already registered`);

        this.components.set(component.name, component);
        this.trigger('componentregister', component);
    }

    destroy() {
        this.trigger('destroy');
    }
}
