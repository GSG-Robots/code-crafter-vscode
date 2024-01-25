export type Maybe<T> = T | undefined;

export type Shouldbe<T> = T | null;


export enum DisplayType {
  html,
  markdown
}

export enum CheckType {
  ast,
  file_exists
}

export type JSONTutorialConfig = {
  display: {
    file: string;
    type: keyof typeof DisplayType;
  };
  checks: {
    type: keyof typeof CheckType;
    at?: string;
    from?: string;
  }[];
};

export type JSONTutorialMeta = {
  title: string;
  author: string;
  version: string;
  description: string;
  hidden?: boolean;
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
  hidden: boolean;
};

export type TutorialConfig = {
  display: {
    file: string;
    type: DisplayType;
  };
  checks: {
    type: CheckType;
    at?: string;
    from?: string;
  }[];
};