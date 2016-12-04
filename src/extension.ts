'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SqlConnection } from './sqllib';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.execSql', () => {

        let text = getSelectedText();
        executeSql(text);
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

function executeSql(text: string) {

    let outputChannel = vscode.window.createOutputChannel('SQL Results');

    outputChannel.show();
    outputChannel['log'] = (text) => { outputChannel.appendLine(text) };

    outputChannel.appendLine(text);
    outputChannel.appendLine('');

    let dbparams = {
        username: 'sql', password: 'sql',
        appname: 'test',
        servername: null, database: null 
    };    

    let rowoutput = new DataOutput(outputChannel);
    let connection = new SqlConnection(dbparams, rowoutput);

    connection.open().then(()=>{
        return connection.execute(text).then( ()=> {
            connection.close();
        });
    }).catch( ()=>{ });;

}


class DataOutput {
    _output: any;

    constructor(output) {
        this._output = output;
    }

    reportInfo(info) {
        this._output.log(info.message);     
    }
    reportError(error) {
        this._output.log('error');
        // this._errorMessages.push(error);
    }

    progressHeader(header) {
        this._output.log('header');
    }
    
    progressRow(row) {
        this._output.log('row');
    }
} 