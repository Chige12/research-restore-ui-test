import { HastNode } from 'hast-util-from-dom/lib';

// type
interface Change {
  from?: string;
  to?: string;
}

export interface Changes {
  [key : string]: Change;
}

export const EVENT = {
  First: 'first',
  CLICK: 'click',
  KEY: 'key'
} as const;

export type EVENT_TYPES = typeof EVENT[keyof typeof EVENT];

export type HastHistory = {
  type: EVENT_TYPES;
  hast: HastNode;
  event?: Event;
}

export type DiffHistory = {
  from: HastHistory | Error;
  to: HastHistory | Error;
  diff: Changes | null;
}

export type Error = {
  text: string;
  log?: unknown;
}

export type Data = {
  hastHistories: Array<HastHistory | Error>;
  diffHistories: Array<DiffHistory>;
  pathName: string;
}

export type Methods = {
  getDOM: (type: EVENT_TYPES, event?: Event) => void;
  deepDiff: (fromObject: HastNode, toObject: HastNode) => Changes;
  recordDiff: () => void;
  createJsonFile: (pathName: string) => void;
}