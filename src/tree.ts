import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import { request, requestJSON } from './utils';
import { DisplayType, JSONTutorialConfig, JSONTutorials, TutorialMeta, TutorialConfig, CheckType } from './types';
import { display } from './view';
import { detectCurrentState, SetupState, getRootPath } from './config';
import * as fs from 'fs';
import * as os from 'os';


export class TutorialProvider implements vscode.TreeDataProvider<TutorialItem> {
  constructor(private baseUri: string) { }

  private _onDidChangeTreeData: vscode.EventEmitter<TutorialItem | undefined | void> = new vscode.EventEmitter<TutorialItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<TutorialItem | undefined | void> = this._onDidChangeTreeData.event;

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  private openedWindow: vscode.WebviewPanel | undefined;

  public async finishTutorial() {
    this.openedWindow?.dispose();
    this.openedWindow = display("# Kein aktuelles Tutorial\nWähle ein Tutorial aus, um es zu starten.", DisplayType.markdown, "codecrafter-tutorial", "CodeCrafter");
    this.getChildren();
    this.refresh();
  }

  private mainPlaceholder: vscode.WebviewPanel | undefined;

  public async openTutorial(id: string): Promise<vscode.WebviewPanel> {
    const tutorialMeta = await this.getTutorialMeta(id);
    const tutorialConfig = await this.getTutorialConfig(id);
    const fileContent = await request(`${this.baseUri}${id}/${tutorialConfig.display.file}`);
    // if (fs.existsSync(`${getRootPath()}/main.py`)) {
    //   const doc = await vscode.workspace.openTextDocument(`${getRootPath()}/main.py`);
    //   vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true);
    //   if (this.mainPlaceholder) {
    //     this.mainPlaceholder.dispose();
    //   }
    // } else {
    //   if (!this.mainPlaceholder) {
    //     this.mainPlaceholder = display("", DisplayType.markdown, "codecrafter-code-placeholder", "main.py", vscode.ViewColumn.One);
    //     this.mainPlaceholder.onDidDispose(() => {
    //       this.mainPlaceholder = undefined;
    //     });
    //   }
    // }
    const newWindow: vscode.WebviewPanel = display(fileContent, tutorialConfig.display.type, "codecrafter-tutorial", `Tutorial: ${tutorialMeta.title}`);
    newWindow.webview.html += `<br><br>
    Erledigt: <input type="checkbox" id="checks-fulfilled" value="off" ${tutorialConfig.checks.length > 0 ? "disabled" : ""}>

    <div id="continue" style="display: none;">
      <a href="command:codecrafter.finishTutorial"><button>Dieses Tutorial abschließen.</button></a>
    </div>
    <script>
    const hasChecks = ${tutorialConfig.checks.length > 0};
    if (hasChecks) {
      window.addEventListener('message', event => {
        const message = event.data;
        if (message?.checksFulfilled === true) {
          document.getElementById("checks-fulfilled").checked = true;
          document.getElementById("continue").style.display = "block";
        } else if (message?.checksFulfilled === false) {
          document.getElementById("checks-fulfilled").checked = false;
          document.getElementById("continue").style.display = "none";
        }
      });
    } else {
      setInterval(() => {
        if (document.getElementById("checks-fulfilled").checked) {
          document.getElementById("continue").style.display = "block";
        } else {
          document.getElementById("continue").style.display = "none";
        }
      });
    }
    </script>
    `;

    if (this.openedWindow) {
      this.openedWindow.dispose();
    }
    this.openedWindow = newWindow;
    const checkInterval = setInterval(() => {
      this.runChecks(id, tutorialConfig.checks).then(fulfilled => {
        this.setChecksCompleted(fulfilled);
      });
    }, 1000);
    newWindow.onDidDispose(() => {
      clearInterval(checkInterval);
    });
    return this.openedWindow;
  }

  private async setChecksCompleted(fulfilled: boolean) {
    this.openedWindow?.webview.postMessage({
      checksFulfilled: fulfilled,
    });
  }

  private async runChecks(id: string, checks: { type: CheckType; at?: string; from?: string }[]): Promise<boolean> {
    return checks.every(check => {
      if (check?.at !== undefined) {
        const rootPath = getRootPath();
        if (rootPath) { check.at = check.at.replace("{ROOT}", rootPath); }
      }
      switch (check.type) {
        case CheckType.ast:
          if (!check.at) { throw new Error("No at provided."); }
          if (!check.from) { throw new Error("No from provided."); }
          const pythonExtension = vscode.extensions.getExtension('ms-python.python');
          if (pythonExtension) {
              const pythonApi = pythonExtension.exports;
              const pythonPath = pythonApi.settings.getExecutionDetails(vscode.Uri.file('prgrmr/tools/compareAst.py')).execCommand[0];
              const stdout = cp.execSync(`${pythonPath} prgrmr/tools/compareAst.py ${check.at} ${check.from}`).toString();
              console.log(stdout);
              return stdout === "True\n";
          } else {
              vscode.window.showErrorMessage("Python extension not found. Checks will be ignored.");
              return true;
          }
        case CheckType.file_exists:
          return fs.existsSync(`${check.at}`);
      }
    });
  }

  public async getTutorial(id: string): Promise<TutorialConfig> {
    const requestUri = `${this.baseUri}${id}/meta.json`;

    const res = await requestJSON(requestUri) as JSONTutorialConfig;
    const tutorial: TutorialConfig = {
      display: {
        file: res.display.file,
        type: DisplayType[res.display.type],
      },
      checks: res.checks.map(check => ({
        type: CheckType[check.type],
        at: check.at,
      })),
    };
    return tutorial;
  }

  getTreeItem(element: TutorialItem): vscode.TreeItem {
    return element;
  }

  public readonly getTutorialConfig = async (id: string): Promise<TutorialConfig> => {
    const requestUri = `${this.baseUri}${id}/meta.json`;
    const res = await requestJSON(requestUri) as JSONTutorialConfig;
    const tutorial: TutorialConfig = {
      display: {
        file: res.display.file,
        type: DisplayType[res.display.type],
      },
      checks: res.checks.map(check => ({
        type: CheckType[check.type],
        at: check.at,
        from: check.from,
      })),
    };
    return tutorial;
  };

  public readonly getTutorialMeta = async (id: string): Promise<TutorialMeta> => {
    const tutorialMap = await this.getTutorialsMeta();
    return tutorialMap[id];
  };

  public readonly getTutorialsMeta = async (): Promise<{ [id: string]: TutorialMeta }> => {
    const requestUri = `${this.baseUri}index.json`;
    const res = await requestJSON(requestUri) as JSONTutorials;
    let tutorialMap: { [id: string]: TutorialMeta } = {};
    for (let [key, tutorial] of Object.entries(res.tutorials)) {
      const tutorialMeta: TutorialMeta = {
        id: key,
        title: tutorial.title || "Unnamed",
        author: tutorial.author || "Unknown",
        version: tutorial.version || "Unknown",
        description: tutorial.description || "No description provided.",
        hidden: tutorial.hidden ?? false,
      };
      tutorialMap[key] = tutorialMeta;
    }
    return tutorialMap;
  };

  async getTutorials(): Promise<TutorialItem[]> {
    let tutorialList: TutorialItem[] = [];
    for (let tutorial of Object.values(await this.getTutorialsMeta())) {
      if (tutorial.hidden) { continue; };
      tutorialList.push(new TutorialItem(tutorial));
    }
    return tutorialList;
  }

  getChildren(element?: TutorialItem): Thenable<TutorialItem[]> {
    switch (detectCurrentState()) {
      case undefined:
        break;
      case SetupState.noFolderOpen:
        this.openTutorial('fix-no-folder-open');
        return Promise.resolve([]);
      case SetupState.noCodeCrafterProject:
        this.openTutorial('fix-no-codecrafter-project');
        return Promise.resolve([]);
      case SetupState.noMainFile:
        this.openTutorial('fix-no-main-file');
        return Promise.resolve([]);
      case SetupState.mainFileEmpty:
        this.openTutorial('getting-started');
        return Promise.resolve([]);
      default:
        this.openTutorial("report-bug");
        break;
    };
    if (element) {
      return element.getChildren();
    } else {
      return this.getTutorials();
    }
  }
}

class TutorialItem extends vscode.TreeItem {
  constructor(
    public readonly meta: TutorialMeta
  ) {
    super(meta.title, vscode.TreeItemCollapsibleState.None);
    this.description = `${meta.author} - ${meta.version}`;
    this.tooltip = meta.description;
  }

  command = {
    command: 'codecrafter.openTutorial',
    title: 'Open Tutorial',
    arguments: [this.meta.id],
  };

  public async getChildren(): Promise<TutorialItem[]> {
    return [];
  }

  iconPath = {
    light: path.join(__filename, '..', 'assets', 'icon.png'),
    dark: path.join(__filename, '..', 'assets', 'icon.png')
  };
}

class Problem extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly command: {
      command: string,
      title: string,
      arguments: any[]
    }
  ) {
    super(name, vscode.TreeItemCollapsibleState.None);
    this.tooltip = "Click to resolve this problem.";
  }

  public async getChildren(): Promise<TutorialItem[]> {
    return [];
  }
}
