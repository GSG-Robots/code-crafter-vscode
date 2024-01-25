import { request as _http_request, RequestOptions as HTTPRequestOptions } from 'http';
import { request as _https_request, RequestOptions as HTTPSRequestOptions } from 'https';
import * as vscode from 'vscode';

export function request(uri: string | HTTPRequestOptions | HTTPSRequestOptions | URL): Promise<string> {
    const _request = uri.toString().startsWith('https://') ? _https_request : _http_request;
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

export async function requestJSON(uri: string | HTTPRequestOptions | HTTPSRequestOptions | URL): Promise<object> {
    const data = await request(uri);
    return JSON.parse(data);
}

export function addCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => any) {
    context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}
