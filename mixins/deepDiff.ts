import Vue from 'vue'
// lodash
import isUndefined from 'lodash/isUndefined';
import has from 'lodash/has';
import get from 'lodash/get';
import entries from 'lodash/entries';
import isEqual from 'lodash/isEqual';
import isObjectLike from 'lodash/isObjectLike';
import keys from 'lodash/keys';
// hast
import { fromDom } from 'hast-util-from-dom'
import { HastNode } from 'hast-util-from-dom/lib'

import {Changes, HastHistory, DiffHistory, Data, Methods, Error, EVENT, EVENT_TYPES} from './deepDiffType'


export default Vue.extend<Data, Methods, {}, {}>({
  data(): Data {
    return {
      hastHistories: [],
      diffHistories: [],
      pathName: '',
    }
  },
  mounted() {
    this.getDOM(EVENT.First)
    this.pathName = location.pathname.replace('/', '-')
    window.addEventListener('click', (e) => this.getDOM(EVENT.CLICK, e), false)
    window.addEventListener('keydown', (e) => this.getDOM(EVENT.KEY, e), false)
  },
  beforeDestroy (): void {
    this.createJsonFile(this.pathName)
  },
  destroyed (): void {
    window.removeEventListener('click', (e) => this.getDOM(EVENT.CLICK, e), false)
    window.removeEventListener('keydown', (e) => this.getDOM(EVENT.KEY, e), false)
  },
  methods: {
    getDOM(type: EVENT_TYPES, event?: Event) {
      const elementId = 'check-component'
      const dom: HTMLElement | null = document.getElementById(elementId)

      if (!dom) {
        const text = 'Error in getDOM: id "check-component" is null.'
        const error: Error = { text }
        console.log(text)
        this.hastHistories.push(error)
        return
      }
      const hast = fromDom(dom);

      const hastHistory: HastHistory = { type, hast, event }
      console.log('Record dom', hastHistory)
      this.hastHistories.push(hastHistory)
      this.recordDiff()
    },
    recordDiff() {
      const hasts = this.hastHistories
      console.log("hasts", hasts)
      const fromHistory = hasts[hasts.length - 2] as HastHistory
      const toHistory   = hasts[hasts.length - 1] as HastHistory

      if((fromHistory && 'hast' in fromHistory) && (toHistory && 'hast' in toHistory)) {
        const changes = this.deepDiff(fromHistory.hast, toHistory.hast)
        console.log('changes', changes)
        const diffHistory: DiffHistory = {
          from: fromHistory,
          to: toHistory,
          diff: changes,
        }
        this.diffHistories.push(diffHistory)
        return;
      }
      const errorHistory: DiffHistory = {
        from: fromHistory,
        to: toHistory,
        diff: null,
      }
      this.diffHistories.push(errorHistory)
    },
    createJsonFile(pathName: string) {
      const jsonHistories = JSON.stringify(this.diffHistories, null, '  ')
      const blob = new Blob([jsonHistories], {
        type: 'application/json',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `diffHistories${pathName}.json`;
      link.click();
      link.remove();
    },
    deepDiff(fromObject: HastNode, toObject: HastNode) {
      const changes: Changes = {};

      const buildPath = (key: string, _obj: HastNode, path?: string ): string => 
        isUndefined(path) ? key : `${path}.${key}`;

      const walk = (fromObject: HastNode, toObject: HastNode, path?: string) => {
        for (const key of keys(fromObject)) {
          const currentPath = buildPath(key, fromObject, path);
          if (!has(toObject, key)) {
            changes[currentPath] = {from: get(fromObject, key)};
          }
        }

        for (const [key, to] of entries(toObject)) {
          const currentPath = buildPath(key, toObject, path);
          if (!has(fromObject, key)) {
            changes[currentPath] = {to};
          } else {
            const from = get(fromObject, key);
            if (!isEqual(from, to)) {
              if (isObjectLike(to) && isObjectLike(from)) {
                walk(from, to, currentPath);
              } else {
                changes[currentPath] = {from, to};
              }
            }
          }
        }
      };

      walk(fromObject, toObject);

      return changes;
    },
  }
})