
import { Events, Context, Validator } from './core.js';

export const State = { AVAILABLE: 0, PROCESSED: 1, ABORT: 2 }


function intersect(array1, array2) {
    return array1.filter(value => -1 !== array2.indexOf(value));
}


export class Component {

    data = {};
    engine = null;

    constructor(name) {
        this.name = name;
    }

    worker(node, inputs, outputs, ...args) {
        return;
    };
}


export class EngineEvents extends Events {

    constructor() {
        super({});
    }
}


export class Recursion {
    constructor(nodes) {
        this.nodes = nodes;
    }

    extractInputNodes(node) {
        return Object.keys(node.inputs).reduce((acc, key) => {
            const { connections } = node.inputs[key];
            const nodesData = (connections || []).reduce((b, c) => {
                return [...b, this.nodes[c.node]];
            }, []);

            return [...acc, ...nodesData]
        }, []);
    }

    findSelf(list, inputNodes) {
        const inters = intersect(list, inputNodes);

        if (inters.length)
            return inters[0];

        for (let node of inputNodes) {
            let l = [node, ...list];
            let inter = this.findSelf(l, this.extractInputNodes(node));

            if (inter)
                return inter;
        }

        return null;
    }

    detect() {
        const nodesArr = Object.keys(this.nodes).map(id => this.nodes[id]);

        for (let node of nodesArr) {
            let inters = this.findSelf([node], this.extractInputNodes(node));

            if (inters)
                return inters;
        }

        return null;
    }
}


export class Engine extends Context {

    args = [];
    data = null;
    state = State.AVAILABLE;
    onAbort = () => { };

    constructor(id) {
        super(id, new EngineEvents());
    }

    clone() {
        const engine = new Engine(this.id);

        this.components.forEach(c => engine.register(c));

        return engine;
    }

    async throwError(message, data = null) {
        await this.abort();
        this.trigger('error', { message, data });
        this.processDone();

        return 'error';
    }

    processStart() {
        if (this.state === State.AVAILABLE) {
            this.state = State.PROCESSED;
            return true;
        }

        if (this.state === State.ABORT) {
            return false;
        }

        console.warn(`The process is busy and has not been restarted.
                Use abort() to force it to complete`);
        return false;
    }

    processDone() {
        const success = this.state !== State.ABORT;

        this.state = State.AVAILABLE;

        if (!success) {
            this.onAbort();
            this.onAbort = () => { }
        }

        return success;
    }

    async abort() {
        return new Promise(ret => {
            if (this.state === State.PROCESSED) {
                this.state = State.ABORT;
                this.onAbort = ret;
            }
            else if (this.state === State.ABORT) {
                this.onAbort();
                this.onAbort = ret;
            }
            else
                ret();
        });
    }

    async lock(node) {
        return new Promise(res => {
            node.unlockPool = node.unlockPool || [];
            if (node.busy && !node.outputData)
                node.unlockPool.push(res);
            else
                res();

            node.busy = true;
        });
    }

    unlock(node) {
        node.unlockPool.forEach(a => a());
        node.unlockPool = [];
        node.busy = false;
    }

    async extractInputData(node) {
        const obj = {};

        for (let key of Object.keys(node.inputs)) {
            const input = node.inputs[key];
            const conns = input.connections;
            const connData = await Promise.all(conns.map(async (c) => {
                const prevNode = (this.data).nodes[c.node];

                const outputs = await this.processNode(prevNode);

                if (!outputs)
                    this.abort();
                else
                    return outputs[c.output];
            }));

            obj[key] = connData;
        }

        return obj;
    }

    async processWorker(node) {
        const inputData = await this.extractInputData(node);
        const component = this.components.get(node.name);
        const outputData = {};

        try {
            await component.worker(node, inputData, outputData, ...this.args);
        } catch (e) {
            this.abort();
            this.trigger('warn', e);
        }

        return outputData;
    }

    async processNode(node) {
        if (this.state === State.ABORT || !node)
            return null;

        await this.lock(node);

        if (!node.outputData) {
            node.outputData = await this.processWorker(node);
        }

        this.unlock(node);
        return node.outputData;
    }

    async forwardProcess(node) {
        if (this.state === State.ABORT)
            return null;

        return await Promise.all(Object.keys(node.outputs).map(async (key) => {
            const output = node.outputs[key];

            return await Promise.all(output.connections.map(async (c) => {
                const nextNode = this.data.nodes[c.node];

                await this.processNode(nextNode);
                await this.forwardProcess(nextNode);
            }));
        }));
    }

    copy(data) {
        data = Object.assign({}, data);
        data.nodes = Object.assign({}, data.nodes);

        Object.keys(data.nodes).forEach(key => {
            data.nodes[key] = Object.assign({}, data.nodes[key])
        });
        return data;
    }

    async validate(data) {
        const checking = Validator.validate(this.id, data);
        const recursion = new Recursion(data.nodes);

        if (!checking.success)
            return await this.throwError(checking.msg);

        const recurrentNode = recursion.detect();

        if (recurrentNode)
            return await this.throwError('Recursion detected', recurrentNode);

        return true;
    }

    async processStartNode(id) {
        if (!id) return;

        let startNode = this.data.nodes[id];

        if (!startNode)
            return await this.throwError('Node with such id not found');

        await this.processNode(startNode);
        await this.forwardProcess(startNode);
    }

    async processUnreachable() {
        const data = this.data;

        for (let i in data.nodes) { // process nodes that have not been reached
            const node = data.nodes[i];

            if (typeof node.outputData === 'undefined') {
                await this.processNode(node);
                await this.forwardProcess(node);
            }
        }
    }

    async process(data, startId = null, ...args) {
        if (!this.processStart()) return;
        if (!this.validate(data)) return;

        this.data = this.copy(data);
        this.args = args;

        await this.processStartNode(startId);
        await this.processUnreachable();

        return this.processDone() ? 'success' : 'aborted';
    }
}
