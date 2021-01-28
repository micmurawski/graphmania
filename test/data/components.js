import { Component, Input, Output, Socket } from '../../src/index.js';

const socketNum = new Socket('Number');

export class Comp1 extends Component {

    constructor() {
        super('Number');
    }

    async builder(node) {
        node.addOutput(new Output('num', 'Name', socketNum))
    }

    worker() { }
}

export class Comp2 extends Component {

    constructor() {
        super('Add');
    }

    async builder(node) {
        node.addInput(new Input('num1', 'Name', socketNum));
        node.addInput(new Input('num2', 'Name', socketNum));
        node.addOutput(new Output('num', 'Name', socketNum))
    }

    worker() { }
}