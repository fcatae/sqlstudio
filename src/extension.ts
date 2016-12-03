'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import { SqlConnection, getConnection } from './sqllib';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.execSql', () => {

        let text = getSelectedText();
        vscode.window.showInformationMessage(text);

        // TODO: Executa comando
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactientvated
export function deactivate() {
}

function getSelectedText() {
    let currentEditor = vscode.window.activeTextEditor;
    let text : string = null;

    if(currentEditor) {
        let document = currentEditor.document;
        let selection = currentEditor.selection;

        if(selection.isEmpty == true) {
            text = document.getText();
        } else {
            text = document.getText(selection)
        }
    }
    
    return text;
}

