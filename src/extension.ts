'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.execSql', () => {
        // TODO: Captura o texto
        captureDocumentText();

        // TODO: Executa comando
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function getCurrentDocument() {
    let currentEditor = vscode.window.activeTextEditor;

    if(currentEditor) {
        return currentEditor.document;
    }
    
    return null;
}

// capture entire document text
function captureDocumentText() {
    let document = getCurrentDocument();
 
    let text = (document != null) ? document.getText() : '';

    vscode.window.showInformationMessage(text);
}