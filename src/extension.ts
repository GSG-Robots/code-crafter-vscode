import * as vscode from 'vscode';
import { TutorialProvider } from './tree';
import { addCommand } from './utils';
import { installCodeCrafter } from './downloader';


export function activate(context: vscode.ExtensionContext) {
	console.log('codecrafter activated.');

	const tutorialServer = "http://localhost:5500/";
	const tutorialProvider = new TutorialProvider(tutorialServer);
	
	context.subscriptions.push(vscode.window.createTreeView('codecrafter-tutorials', {
		treeDataProvider: tutorialProvider,
	}));

	addCommand(context, 'codecrafter.openTutorial', tutorialProvider.openTutorial.bind(tutorialProvider));
	addCommand(context, 'codecrafter.install', installCodeCrafter);
	addCommand(context, 'codecrafter.finishTutorial', tutorialProvider.finishTutorial.bind(tutorialProvider));

	tutorialProvider.refresh();
	tutorialProvider.getChildren();
}

export function deactivate() {
	console.log('codecrafter deactivated.');
}
