import * as vscode from 'vscode';
import { Maybe } from './types';
import * as fs from 'fs';

export enum SetupState {
    noFolderOpen,
    noCodeCrafterProject,
    noMainFile,
    mainFileEmpty,
}

export function getRootPath(): Maybe<string> {
    return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;
}

export function detectCurrentState(): Maybe<SetupState> {
    const rootPath = getRootPath();
    if (!rootPath) {
        vscode.window.showErrorMessage('Es ist kein Ordner geöffnet.');
        return SetupState.noFolderOpen;
    }

    const isCodeCrafterProject = fs.existsSync(`${rootPath}/prgrmr`);
    if (!isCodeCrafterProject) {
        return SetupState.noCodeCrafterProject;
    }

    const mainFileExists = fs.existsSync(`${rootPath}/main.py`);
    if (!mainFileExists) {
        return SetupState.noMainFile;
    }

    const mainFileEmpty = fs.readFileSync(`${rootPath}/main.py`).toString().trim() === '';
    if (mainFileEmpty) {
        return SetupState.mainFileEmpty;
    }

    return undefined;
}


