
export enum DisplayType {
  html,
  markdown
}

export enum CheckType {
  ast
}

export type JSONTutorialConfig = {
  display: {
    file: string;
    type: keyof typeof DisplayType;
  };
  checks: {
    type: keyof typeof CheckType;
    from?: string;
  }[];
};

export type JSONTutorialMeta = {
  title: string;
  author: string;
  version: string;
  description: string;
};

export type JSONTutorials = {
  tutorials: {
    [id: string]: JSONTutorialMeta;
  };
};


export type TutorialMeta = {
  id: string;
  title: string;
  author: string;
  version: string;
  description: string;
};

export type TutorialConfig = {
  display: {
    file: string;
    type: DisplayType;
  };
  checks: {
    type: CheckType;
    from?: string;
  }[];
};