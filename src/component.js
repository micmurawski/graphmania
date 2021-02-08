import { Component as ComponentWorker } from './engine.js';
import { Node } from './node.js';


export class Component extends ComponentWorker {

    editor = null;
    data = {};

    constructor(name) {
        super(name);
    }

    async builder(node) {
        return;
    }

    async build(node) {
        await this.builder(node);
        return node;
    }

    async createNode(data = {}) {
        const node = new Node(this.name);
        node.data = data;
        await this.build(node);
        return node;
    }
}