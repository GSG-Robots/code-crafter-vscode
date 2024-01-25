import * as vscode from 'vscode';
import { TutorialProvider } from './tree';
import { addCommand } from './utils';


export function activate(context: vscode.ExtensionContext) {
	console.log('codecrafter activated.');

	const tutorialProvider = new TutorialProvider("http://localhost:5500/tutorials/");
	addCommand(context, 'codecrafter.openTutorial', tutorialProvider.openTutorial.bind(tutorialProvider));

	context.subscriptions.push(vscode.window.createTreeView('codecrafter-tutorials', {
		treeDataProvider: tutorialProvider,
	}));
}

export function deactivate() {
	console.log('codecrafter deactivated.');
}
