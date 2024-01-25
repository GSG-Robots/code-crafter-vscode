// TODO: Finish loading from json
// TODO: Add open tutorial on click in tree


// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TutorialProvider } from './tree';
import { display } from './view';
import { DisplayType } from './types';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codecrafter" is now active!');

	display(DisplayType.markdown, "codecrafter", "CodeCrafter", "```python\nprint('Hello World!')\nreturn None\n```");

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('codecrafter.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from CodeCrafter!');
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(vscode.window.createTreeView('codecrafter-tutorials', {
		treeDataProvider: new TutorialProvider("http://localhost:5500/tutorials/"),
	}));
}

// This method is called when your extension is deactivated
export function deactivate() { }
