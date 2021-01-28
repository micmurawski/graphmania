
export class Socket {

    name;
    data;
    compatible = [];

    constructor(name, data = {}) {
        this.name = name;
        this.data = data;
        this.compatible = [];
    }

    combineWith(socket) {
        this.compatible.push(socket);
    }

    compatibleWith(socket) {
        return this === socket || this.compatible.includes(socket);
    }
}