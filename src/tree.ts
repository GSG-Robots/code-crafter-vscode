import * as vscode from 'vscode';
import * as path from 'path';
import { request, requestJSON } from './utils';
import { DisplayType, JSONTutorialConfig, JSONTutorials, TutorialMeta, TutorialConfig, CheckType } from './types';
import { display } from './view';


export class TutorialProvider implements vscode.TreeDataProvider<TutorialItem> {
  constructor(private baseUri: string) { }

  public async openTutorial(id: string) {
    const tutorialMeta = await this.getTutorialMeta(id);
    const tutorialConfig = await this.getTutorialConfig(id);
    const fileContent = await request(`${this.baseUri}${id}/${tutorialConfig.display.file}`);
    display(fileContent, tutorialConfig.display.type, "codecrafter-tutorial", `Tutorial: ${tutorialMeta.title}`);
  }

  public async getTutorial(id: string): Promise<TutorialConfig> {
    const requestUri = `${this.baseUri}${id}/meta.json`;
    console.log(requestUri);

    const res = await requestJSON(requestUri) as JSONTutorialConfig;
    const tutorial: TutorialConfig = {
      display: {
        file: res.display.file,
        type: DisplayType[res.display.type],
      },
      checks: res.checks.map(check => ({
        type: CheckType[check.type],
        from: check.from,
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
      };
      tutorialMap[key] = tutorialMeta;
    }
    return tutorialMap;
  };

  async getTutorials(): Promise<TutorialItem[]> {
    let tutorialList: TutorialItem[] = [];
    for (let tutorial of Object.values(await this.getTutorialsMeta())) {
      tutorialList.push(new TutorialItem(tutorial));
    }
    return tutorialList;
  }

  getChildren(element?: TutorialItem): Thenable<TutorialItem[]> {
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
