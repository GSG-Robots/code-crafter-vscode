import * as showdown from 'showdown';
const showdownHighlight = require('showdown-highlight');
import * as vscode from 'vscode';
import { DisplayType } from './types';

export function displayMarkdown(
    id = "codecrafter",
    title = "CodeCrafter",
    content: string = "No content provided."
) {
    let window = vscode.window.createWebviewPanel(id, title, vscode.ViewColumn.One);
    window.webview.html = "<b>Loading...</b>";
    const converter = new showdown.Converter({
        strikethrough: true,
        simplifiedAutoLink: true,
        tables: true,
        tasklists: true,
        ghCodeBlocks: true,
        simpleLineBreaks: true,
        ghMentions: true,
        emoji: true,
        openLinksInNewWindow: true,
        backslashEscapesHTMLTags: true,
        underline: true,
        encodeEmails: true,
        completeHTMLDocument: true,
        ellipsis: true,
        requireSpaceBeforeHeadingText: true,
        tablesHeaderId: true,
        ghCompatibleHeaderId: true,
        customizedHeaderId: true,
        excludeTrailingPunctuationFromURLs: true,
        parseImgDimensions: true,
        splitAdjacentBlockquotes: true,
        extensions: [showdownHighlight]
    });
    converter.setFlavor('github');
    const html = converter.makeHtml(content);

    const styledHtml = html.replace(/<head>/g, '<head><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css">');

    window.webview.html = styledHtml;
}


export function displayHTML(
    id = "codecrafter",
    title = "CodeCrafter",
    content: string = "No content provided."
) {
    let window = vscode.window.createWebviewPanel(id, title, vscode.ViewColumn.One);
    window.webview.html = content;
}

export function display(
    type: DisplayType = DisplayType.markdown,
    id: string = "codecrafter",
    title: string = "CodeCrafter",
    content: string,
) {
    switch (type) {
        case DisplayType.markdown:
            displayMarkdown(id, title, content);
            break;
        case DisplayType.html:
            displayHTML(id, title, content);
            break;
        default:
            displayMarkdown(id, title, content);
            break;
    }
}
