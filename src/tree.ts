import * as vscode from 'vscode';
import * as path from 'path';
import { request } from 'http';
import { DisplayType, TutorialResult } from './types';


export class TutorialProvider implements vscode.TreeDataProvider<Tutorial> {
  constructor(private baseUri: string) { }

  private getTutorial(id: string): Promise<TutorialResult> {
    return new Promise((resolve, reject) => {
      const requestUri = `${this.baseUri}${id}/meta.json`;

      console.log(requestUri);

      request(requestUri, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          console.log(body);
          const tutorial = JSON.parse(body);
          const result: TutorialResult = {
            title: tutorial.title || "Unnamed",
            author: tutorial.author || "Unknown",
            version: tutorial.version || "Unknown",
            description: tutorial.description || "No description provided.",
            display: {
              file: tutorial.show.file,
              type: DisplayType[tutorial.show.type as keyof typeof DisplayType],
            },
          };
          resolve(result);
        });
      });
    });
  }

  getTreeItem(element: Tutorial): vscode.TreeItem {
    return element;
  }

  getTutorials(): Promise<Tutorial[]> {
    return new Promise((resolve, reject) => {
      const requestUri = `${this.baseUri}index.json`;


      request(requestUri, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('error', (err) => {
          reject(err);
        });

        res.on('end', async () => {
          console.log(body);
          const tutorials = JSON.parse(body);
          let tutorialList: Tutorial[] = [];
          for (let key of Object.keys(tutorials.tutorials)) {
            const data: TutorialResult = await this.getTutorial(key);
            tutorialList.push(new Tutorial(key, data));
          }
          resolve(tutorialList);
        });
      });
    });
  }

  getChildren(element?: Tutorial): Thenable<Tutorial[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return this.getTutorials();
    }
  }
}

class Tutorial extends vscode.TreeItem {
  constructor(
    public readonly id: string,
    private readonly data: TutorialResult
  ) {
    super(data.title, vscode.TreeItemCollapsibleState.None);
    this.description = `${data.author} - ${data.version}}`;
    this.tooltip = data.description;
  }

  iconPath = {
    light: path.join(__filename, '..', 'assets', 'icon.png'),
    dark: path.join(__filename, '..', 'assets', 'icon.png')
  };
}
