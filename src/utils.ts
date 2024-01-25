import { request as _request, RequestOptions } from 'http';
import * as vscode from 'vscode';

export function request(uri: string | RequestOptions | URL): Promise<string> {
    return new Promise((resolve, reject) => {
        const req = _request(uri, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                resolve(body);
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

export async function requestJSON(uri: string | RequestOptions | URL): Promise<object> {
    const data = await request(uri);
    return JSON.parse(data);
}

export function addCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => any) {
    context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}
