
export enum DisplayType {
  html,
  markdown
}

export type TutorialResult = {
  title: string;
  author: string;
  version: string;
  description: string;

  display: {
    file: string;
    type: DisplayType;
  };
};