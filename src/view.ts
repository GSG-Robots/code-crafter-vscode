import * as showdown from 'showdown';
const showdownHighlight = require('showdown-highlight');
import * as vscode from 'vscode';
import { DisplayType } from './types';


const gfmAlertStyles = `
<style>
.alert {
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
    border-left: .25rem solid #434b55;
}

.alert > p.alert-title {
    margin-top: 0;
    margin-bottom: .25rem;
}

.alert > p.alert-content {
    margin-bottom: 0;
}

.alert.alert-note {
    border-color: #306cc8;
}

.alert.alert-note > p.alert-title {
    color: #306cc8;
}

.alert.alert-tip {
    border-color: #55aa58;
}

.alert.alert-tip > p.alert-title {
    color: #55aa58;
}

.alert.alert-important {
    border-color: #9a70e3;
}

.alert.alert-important > p.alert-title {
    color: #9a70e3;
}

.alert.alert-warning {
    border-color: #c69026;
}

.alert.alert-warning > p.alert-title {
    color: #c69026;
}

.alert.alert-caution {
    border-color: #e8554d;
}

.alert.alert-caution > p.alert-title {
    color: #e8554d;
}
</style>
`;

const gfmAlertsMap: {
    [key: string]: string;
} = {
    TIP: 'Tipp',
    NOTE: 'Info',
    IMPORTANT: 'Wichtig',
    WARNING: 'Achtung',
    CAUTION: 'Gefahr'
};

function getShowdownExtension() {
    let hasAddedStyles = false;

    return function () {
        return [
            {
                type: 'output',
                filter: function (text: string) {

                    text = text.replace(/<blockquote>(?:\s|<br>)*<p>(?:\s|<br>)*\[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION)\](?:\s|<br>)*(.+?)(?:\s|<br>)*<\/p>(?:\s|<br>)*<\/blockquote>/gsi, function (wholeMatch: string, type: string, content: string) {
                        let styleAddition = !hasAddedStyles ? gfmAlertStyles : '';
                        if (!hasAddedStyles) {
                            hasAddedStyles = true;
                        }
                        return styleAddition + '<div class="alert alert-' + type.toLowerCase() + '"><p class="alert-title">' + gfmAlertsMap[type] + '</p><p class="alert-content">' + content + '</p></div>';
                    });
                    return text;
                }
            },
            {
                type: "lang",
                filter: function (text: string) {
                    text = text.replace(/!btn\[(.+?)\]\((.+?)\)/gsi, function (wholeMatch: string, display: string, url: string) {
                        return '<a class="btn" href="' + url + '"><button>' + display + '</button></a>';
                    });
                    return text;
                }
            }
        ];
    };
};

export function displayMarkdown(
    id = "codecrafter",
    title = "CodeCrafter",
    content: string = "No content provided.", viewColumn: vscode.ViewColumn = vscode.ViewColumn.Beside,
    onClose?: () => void
): vscode.WebviewPanel {
    let window = vscode.window.createWebviewPanel(id, title, viewColumn, { enableCommandUris: true, enableScripts: true });
    window.onDidDispose(() => {
        if (onClose) {
            onClose();
        }
    });

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
        extensions: [showdownHighlight, getShowdownExtension()]
    });
    converter.setFlavor('github');
    const html = converter.makeHtml(content);

    const styledHtml = html.replace(/<head>/g, '<head><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css">');

    window.webview.html = styledHtml;

    return window;
}


export function displayHTML(
    id = "codecrafter",
    title = "CodeCrafter",
    content: string = "No content provided.", viewColumn: vscode.ViewColumn = vscode.ViewColumn.Beside,
    onClose?: () => void
): vscode.WebviewPanel {
    let window = vscode.window.createWebviewPanel(id, title, viewColumn, { enableCommandUris: true, enableScripts: true });
    window.webview.html = content;
    window.onDidDispose(() => {
        if (onClose) {
            onClose();
        }
    });

    return window;
}

export function display(
    content: string,
    type: DisplayType = DisplayType.markdown,
    id: string = "codecrafter",
    title: string = "CodeCrafter",
    viewColumn: vscode.ViewColumn = vscode.ViewColumn.Beside,
    onClose?: () => void
): vscode.WebviewPanel {
    switch (type) {
        case DisplayType.markdown:
            return displayMarkdown(id, title, content, viewColumn, onClose);
        case DisplayType.html:
            return displayHTML(id, title, content, viewColumn, onClose);
        default:
            return displayMarkdown(id, title, content, viewColumn, onClose);
    }
}

export function closeAllTabs() {
    vscode.commands.executeCommand('workbench.action.closeAllEditors');
}
