export class IO {

    node = null;
    multipleConnections;
    connections;

    key;
    name;
    socket;

    constructor(key, name, socket, multiConns) {
        this.node = null;
        this.multipleConnections = multiConns;
        this.connections = [];

        this.key = key;
        this.name = name;
        this.socket = socket;
    }

    removeConnection(connection) {
        this.connections.splice(this.connections.indexOf(connection), 1);
    }

    removeConnections() {
        this.connections.forEach(connection => this.removeConnection(connection));
    }
}

export class Output extends IO {

    constructor(key, title, socket, multiConns = true) {
        super(key, title, socket, multiConns);
    }

    hasConnection() {
        return this.connections.length > 0;
    }

    connectTo(input) {
        if (!this.socket.compatibleWith(input.socket))
            throw new Error('Sockets not compatible');
        if (!input.multipleConnections && input.hasConnection())
            throw new Error('Input already has one connection');
        if (!this.multipleConnections && this.hasConnection())
            throw new Error('Output already has one connection');

        const connection = new Connection(this, input);

        this.connections.push(connection);
        return connection;
    }

    connectedTo(input) {
        return this.connections.some((item) => {
            return item.input === input;
        });
    }

    toJSON() {
        return {
            'connections': this.connections.map(c => {
                if (!c.input.node) throw new Error('Node not added to Input');

                return {
                    node: c.input.node.id,
                    input: c.input.key,
                    data: c.data
                }
            })
        };
    }
}

export class Input extends IO {

    control = null;

    constructor(key, title, socket, multiConns = false) {
        super(key, title, socket, multiConns);
    }

    hasConnection() {
        return this.connections.length > 0;
    }

    addConnection(connection) {
        if (!this.multipleConnections && this.hasConnection())
            throw new Error('Multiple connections not allowed');
        this.connections.push(connection);
    }

    addControl(control) {
        this.control = control;
        control.parent = this;
    }

    showControl() {
        return !this.hasConnection() && this.control !== null;
    }

    toJSON() {
        return {
            'connections': this.connections.map(c => {
                if (!c.output.node) throw new Error('Node not added to Output');

                return {
                    node: c.output.node.id,
                    output: c.output.key,
                    data: c.data
                };
            })
        };
    }
}

export class Connection {

    output;
    input;
    data = {};

    constructor(output, input) {
        this.output = output;
        this.input = input;
        this.data = {};

        this.input.addConnection(this);
    }

    remove() {
        this.input.removeConnection(this);
        this.output.removeConnection(this);
    }
}