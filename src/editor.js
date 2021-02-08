import { Context, Validator } from './core.js';
import { EditorEvents } from './events.js';
import { Node } from './node.js';
import { Selected } from './selected.js';
import { EditorView } from './view/index.js';
import { listenWindow } from './view/utils.js';
import { Component } from './component.js';


export class NodeEditor extends Context {

    nodes = [];
    selected = new Selected();
    view;

    constructor(id, container) {
        super(id, new EditorEvents());

        this.view = new EditorView(container, this.components, this);

        this.on('destroy', listenWindow('keydown', e => this.trigger('keydown', e)));
        this.on('destroy', listenWindow('keyup', e => this.trigger('keyup', e)));

        this.on('selectnode', ({ node, accumulate }) => this.selectNode(node, accumulate));
        this.on('nodeselected', () => this.selected.each(n => {
            const nodeView = this.view.nodes.get(n);

            nodeView && nodeView.onStart()
        }));
        this.on('translatenode', ({ dx, dy }) => this.selected.each(n => {
            const nodeView = this.view.nodes.get(n);

            nodeView && nodeView.onDrag(dx, dy)
        }));
    }

    addNode(node) {
        if (!this.trigger('nodecreate', node)) return;

        this.nodes.push(node);
        this.view.addNode(node);

        this.trigger('nodecreated', node);
    }

    removeNode(node) {
        if (!this.trigger('noderemove', node)) return;

        node.getConnections().forEach(c => this.removeConnection(c));

        this.nodes.splice(this.nodes.indexOf(node), 1);
        this.view.removeNode(node);

        this.trigger('noderemoved', node);
    }

    connect(output, input, data = {}) {
        if (!this.trigger('connectioncreate', { output, input })) return;

        try {
            const connection = output.connectTo(input);

            connection.data = data;
            this.view.addConnection(connection);

            this.trigger('connectioncreated', connection);
        } catch (e) {
            this.trigger('warn', e)
        }
    }

    removeConnection(connection) {
        if (!this.trigger('connectionremove', connection)) return;

        this.view.removeConnection(connection);
        connection.remove();

        this.trigger('connectionremoved', connection);
    }

    selectNode(node, accumulate = false) {
        if (this.nodes.indexOf(node) === -1)
            throw new Error('Node not exist in list');

        if (!this.trigger('nodeselect', node)) return;

        this.selected.add(node, accumulate);

        this.trigger('nodeselected', node);
    }

    getComponent(name) {
        const component = this.components.get(name);

        if (!component)
            throw `Component ${name} not found`;

        return component;
    }

    register(component) {
        super.register(component)
        component.editor = this;
    }

    clear() {
        [...this.nodes].forEach(node => this.removeNode(node));
        this.trigger('clear');
    }

    toJSON() {
        const data = { id: this.id, nodes: {} };

        this.nodes.forEach(node => data.nodes[node.id] = node.toJSON());
        this.trigger('export', data);
        return data;
    }

    beforeImport(json) {
        const checking = Validator.validate(this.id, json);

        if (!checking.success) {
            this.trigger('warn', checking.msg);
            return false;
        }

        this.silent = true;
        this.clear();
        this.trigger('import', json);
        return true;
    }

    afterImport() {
        this.silent = false;
        return true;
    }

    async fromJSON(json) {
        if (!this.beforeImport(json)) return false;
        const nodes = {};

        try {
            await Promise.all(Object.keys(json.nodes).map(async id => {
                const node = json.nodes[id];
                const component = this.getComponent(node.name);
                //console.log(component)
                //throw new Error(component)


                nodes[id] = await component.build(Node.fromJSON(node));
                this.addNode(nodes[id]);
            }));

            Object.keys(json.nodes).forEach(id => {
                const jsonNode = json.nodes[id];
                const node = nodes[id];

                Object.keys(jsonNode.outputs).forEach(key => {
                    const outputJson = jsonNode.outputs[key];

                    outputJson.connections.forEach(jsonConnection => {
                        const nodeId = jsonConnection.node;
                        const data = jsonConnection.data;
                        const targetOutput = node.outputs.get(key);
                        const targetInput = nodes[nodeId].inputs.get(jsonConnection.input);

                        if (!targetOutput || !targetInput) {
                            return this.trigger('error', `IO not found for node ${node.id}`);
                        }

                        this.connect(targetOutput, targetInput, data);
                    });
                });

            });
        } catch (e) {
            this.trigger('warn', e);
            return !this.afterImport();
        }

        return this.afterImport();
    }
}