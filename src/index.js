import { Component } from './engine.js';
import { Control } from './control.js';
import { Emitter } from './core.js';
import { IO, Output, Input, Connection } from './io.js';
import { Node } from './node.js';
import { NodeEditor } from './editor.js';
import { Socket } from './socket.js';
import { Engine, Recursion } from './engine.js';
import { EditorView } from './view/index.js';

export default {
    Engine,
    Recursion,
    Component,
    Control,
    Connection,
    Emitter,
    Input,
    IO,
    Node,
    NodeEditor,
    Output,
    Socket
}


var context = new Engine("name@0.0.1");
var editor = new EditorView();
console.log(context.events)