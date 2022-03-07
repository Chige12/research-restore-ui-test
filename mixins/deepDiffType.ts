import { HastNode, HastElement, HastRoot } from 'hast-util-from-dom/lib';

export type Operation = "add" | "replace" | "remove";
export interface Diff { 
  op: Operation; 
  path: Array<string | number>;
  value: any
}
export type JustDiff = Array<Diff>

export type DiffType = "class" | "style" | "dom"

export type ElementDiff = HastNode | JustRootHastNode | JustElementHastNode | undefined
export type ElementDiffs = {
  from?: ElementDiff
  to?: ElementDiff
}

export interface Info {
  type: DiffType,
  elementDiffs: ElementDiffs | null,
  from?: HastNode | undefined,
}
export type Diffs = Array<Diff>
export type DiffAndInfos = Array<Diff & Info>

export const EVENT = {
  First: 'first',
  CLICK: 'click',
  KEY: 'key'
} as const;

export type EVENT_TYPES = typeof EVENT[keyof typeof EVENT];

export type EventInfo = {
  event: Event;
  type: string;
  eventHast: HastNode;
  eventId: string;
}

export type HastHistory = {
  type: EVENT_TYPES;
  hast: HastNode;
  eventInfo?: EventInfo | undefined;
}

export type DiffHistory = {
  from: HastHistory | Error;
  to: HastHistory | Error;
  diffs: Diffs | null;
  diffAndInfos : DiffAndInfos | null;
}

export type Error = {
  text: string;
  log?: unknown;
}

export type Data = {
  hastHistories: Array<HastHistory | Error>;
  diffHistories: Array<DiffHistory>;
  pathName: string;
  mergeIdList: string[];
}

type JustRootHastNode = {
  type: HastRoot['type']
}

export type JustElementHastNode = {
  type: HastElement['type'];
  tagName: HastElement['tagName'];
  properties?: HastElement['properties'];
  content?: HastElement['content'];
  styles?: CSSStyle[];
}

export type CSSStyle = {
  property: string,
  value: string
}

export type Methods = {
  setIdToAllElements: (pathName: string) => void;
  createHastHistory: (type: EVENT_TYPES, event?: Event) => void;
  getEventInfo: (event?: Event) => EventInfo | undefined;
  createAndSaveDiff: () => void;
  createJsonFile: (pathName: string) => void;
  convertDiffAndInfos: (diffs: JustDiff, fromHast: HastNode, toHast: HastNode) => DiffAndInfos;
  uniqueDiffAndInfos: (diffAndInfos: DiffAndInfos) => DiffAndInfos;
  addStylesFromDiffAndInfos: (diffAndInfos: DiffAndInfos) => DiffAndInfos;
  addStylesFromElementDiffs:(elem: ElementDiff) => ElementDiff;
  getIdFromElementDiffs: (elem: ElementDiff) => string | null;
  checkDiffType: (diff: Diff) => DiffType;
  getFrom: (diff: Diff, fromHast: HastNode ) => HastNode | undefined;
  getElementDiffs: (diff: Diff, fromHast: HastNode, toHast: HastNode) => ElementDiffs | null;
  getJustElementHast: (hast: HastNode, path: Diff['path']) => ElementDiff;
  getStyles: (element: HTMLElement) => CSSStyle[];
}