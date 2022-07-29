import Vue from 'vue'
import get from 'lodash/get'
import { fromDom } from 'hast-util-from-dom'

import { diff as justDiff } from 'just-diff'
import { HastElement, HastNode } from 'hast-util-from-dom/lib'
import cssProperties from 'css-properties'
import {
  HastHistory,
  DiffHistory,
  Data,
  Methods,
  Error,
  EVENT,
  EVENT_TYPES,
  JustDiff,
  DiffAndInfos,
  DiffType,
  Diff,
  ElementDiffs,
  EventInfo,
  CSSStyle,
  ElementDiff,
  elementStyle,
} from './deepDiffType'

const ROOT_ELEMENT_ID = 'check-component'

export default Vue.extend<Data, Methods, {}, {}>({
  data(): Data {
    return {
      rootElement: null,
      hastHistories: [],
      diffHistories: [],
      pathName: '',
      mergeIdList: [],
      allElementStylesPerDiff: [],
      allElementStyleDiffs: [],
    }
  },

  mounted() {
    const pathName = location.pathname.replaceAll('/', '-')
    const rootElement = document.getElementById(ROOT_ELEMENT_ID)
    if (rootElement === null) {
      console.log('Error! not exist root element!')
      return
    }
    this.pathName = pathName
    this.rootElement = rootElement
    this.setIdToAllElements(pathName, rootElement)
    this.setAllElementStyles(rootElement)
    this.createHastHistory(EVENT.First)

    window.addEventListener(
      'click',
      (e) => this.createHastHistory(EVENT.CLICK, e),
      false
    )
    window.addEventListener(
      'keydown',
      (e) => this.createHastHistory(EVENT.KEY, e),
      false
    )
  },

  beforeUnmount(): void {
    this.createJsonFile(this.pathName)
  },

  unmounted(): void {
    window.removeEventListener(
      'click',
      (e) => this.createHastHistory(EVENT.CLICK, e),
      false
    )
    window.removeEventListener(
      'keydown',
      (e) => this.createHastHistory(EVENT.KEY, e),
      false
    )
  },

  methods: {
    sleep(ms: number): Promise<unknown> {
      const sleep = new Promise((resolve: (value: unknown) => void) =>
        setTimeout(resolve, ms)
      )
      return sleep
    },

    setIdToAllElements(pathName: string, rootElement: HTMLElement) {
      rootElement.querySelectorAll('*').forEach((node, index) => {
        if (node.id) return

        const random = Math.random().toString(32).substring(2)
        const id = `ReReUiTestId${pathName}-${node.tagName}-${random}`
        node.setAttribute('id', id)
      })
    },

    setAllElementStyles(rootElement: HTMLElement) {
      const allElement = Array.from(rootElement.querySelectorAll('*'))
      const allElementStyles = allElement.map((node: Element) => {
        return this.getElementStyle(node, node.id)
      })
      this.allElementStylesPerDiff.push(allElementStyles)
    },

    getElementStyle(elem: Element, id: string): elementStyle {
      const styles = this.getStyles(elem)
      return { id, styles }
    },

    async createHastHistory(type: EVENT_TYPES, event?: Event) {
      if (!this.rootElement) {
        const text = 'Error in createHastHistory: id "check-component" is null.'
        const error: Error = { text }
        console.log(text)
        this.hastHistories.push(error)
        return
      }
      const pathName = location.pathname.replaceAll('/', '-')
      this.setIdToAllElements(pathName, this.rootElement)

      const eventInfo = this.getEventInfo(event)
      const hast = fromDom(this.rootElement)
      const hastHistory: HastHistory = { type, hast, eventInfo }
      this.hastHistories.push(hastHistory)
      this.createAndSaveDiff()
      this.setAllElementStyles(this.rootElement)
    },

    getEventInfo(event?: Event): EventInfo | undefined {
      const target = event ? event.target : null
      const isTarget = target instanceof HTMLElement
      if (event && target && isTarget) {
        const element = target as HTMLElement
        const eventHast = fromDom(element)
        const eventId = element.id
        return {
          event,
          type: event.type,
          eventHast,
          eventId,
        }
      }
      return undefined
    },

    createAndSaveDiff() {
      const hasts = this.hastHistories
      const fromHistory = hasts[hasts.length - 2] as HastHistory
      const toHistory = hasts[hasts.length - 1] as HastHistory

      const isSave =
        fromHistory && 'hast' in fromHistory && toHistory && 'hast' in toHistory

      if (isSave) {
        const diffs = justDiff(fromHistory.hast, toHistory.hast)
        const diffAndInfos = this.convertDiffAndInfos(
          diffs,
          fromHistory.hast,
          toHistory.hast
        )

        const diffHistory: DiffHistory = {
          from: fromHistory,
          to: toHistory,
          diffs,
          diffAndInfos,
        }
        this.diffHistories.push(diffHistory)
        console.log('SAVE DONE!')
        return
      }

      const errorHistory: DiffHistory = {
        from: fromHistory,
        to: toHistory,
        diffs: null,
        diffAndInfos: null,
      }
      this.diffHistories.push(errorHistory)
      console.log('SAVE DONE! (first errer)')
    },

    createJsonFile(pathName: string) {
      const obj = {
        diffHistories: this.diffHistories,
        allElementStylesPerDiff: this.allElementStylesPerDiff,
      }
      const json = JSON.stringify(obj, null, '  ')
      const blob = new Blob([json], {
        type: 'application/json',
      })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `diffHistories${pathName}.json`
      link.click()
      link.remove()
    },

    convertDiffAndInfos(
      diffs: JustDiff,
      fromHast: HastNode,
      toHast: HastNode
    ): DiffAndInfos {
      const diffAndInfos = diffs.map((diff) => {
        const type = this.checkDiffType(diff)
        const from = this.getFrom(diff, fromHast)
        const elementDiffs = this.getElementDiffs(diff, fromHast, toHast)
        return {
          ...diff,
          type,
          elementDiffs,
          from,
          styleDiffs: null,
        }
      })
      // CSSのclass配列のdiffを順不同で検証したいので、同じidのDOMが存在する場合マージする
      const uniqueDiffAndInfos = this.uniqueDiffAndInfos(diffAndInfos)
      const diffAndInfoWithStyles =
        this.addStylesFromDiffAndInfos(uniqueDiffAndInfos)
      return diffAndInfoWithStyles
    },

    uniqueDiffAndInfos(diffAndInfos: DiffAndInfos): DiffAndInfos {
      return diffAndInfos.filter((diff) => {
        if (diff.type !== 'class') return true
        const elem = diff.elementDiffs?.to
        const id = this.getIdFromElementDiffs(elem)
        if (!id) return true
        const isUnique = !this.mergeIdList.includes(id)
        if (isUnique) {
          this.mergeIdList.push(id)
          return true
        }
      })
    },

    addStylesFromDiffAndInfos(diffAndInfos: DiffAndInfos): DiffAndInfos {
      return diffAndInfos.map((diff) => {
        if (diff.type !== 'class') return diff
        const toDiff = diff.elementDiffs?.to
        const fromDiff = diff.elementDiffs?.from
        const to = this.addStylesFromElementDiffs(toDiff)
        const from = this.addStylesFromElementDiffs(fromDiff)
        const elementDiffs = { to, from }
        const styleDiffs = this.getStyleDiffs(to, from)
        console.log('styleDiffs', styleDiffs)
        const diffWithStyles = { ...diff, elementDiffs, styleDiffs }
        return diffWithStyles
      })
    },

    addStylesFromElementDiffs(elem: ElementDiff): ElementDiff {
      const id = this.getIdFromElementDiffs(elem)
      console.log(id)
      if (!id) return elem
      const element = document.getElementById(id)
      console.log(element)
      if (!element) return elem
      const styles = this.getStyles(element)
      console.log(styles)
      const elemWithStyle = { ...elem, styles } as ElementDiff
      return elemWithStyle
    },

    getIdFromElementDiffs(elem: ElementDiff): string | null {
      // todo: 説明変数化（なぜか変数にすると型推論が効かなくなる）
      if (!elem || !('properties' in elem) || elem.properties === undefined)
        return null
      return elem.properties.id as string
    },

    getStyleDiffs(to: ElementDiff, from: ElementDiff): JustDiff | null {
      console.log(to, from)
      if (!to || !('styles' in to) || to.styles === undefined) return null
      if (!from || !('styles' in from) || from.styles === undefined) return null
      console.log(to.styles, from.styles)
      const styleDiffs = justDiff(to.styles, from.styles)
      return styleDiffs
    },

    checkDiffType(diff: Diff): DiffType {
      const { path } = diff
      const isClass = path.includes('className')
      if (isClass) return 'class'
      const isStyle = path.includes('style')
      if (isStyle) return 'style'
      return 'dom'
    },

    getFrom(diff: Diff, fromHast: HastNode): HastNode | undefined {
      const { op, path } = diff
      if (op === 'add') return
      return get(fromHast, path)
    },

    getElementDiffs(
      diff: Diff,
      fromHast: HastNode,
      toHast: HastNode
    ): ElementDiffs | null {
      const { path } = diff
      const index = path.lastIndexOf('children')
      if (index === -1) return null

      const lastHastPath = path.slice(0, index + 2)
      const toHastElement = toHast as HastElement
      const fromHastElement = fromHast as HastElement
      const toJustHast = this.getJustElementHast(toHastElement, lastHastPath)
      const fromJustHast = this.getJustElementHast(
        fromHastElement,
        lastHastPath
      )
      if (!toJustHast && !fromJustHast) return null
      return {
        from: fromJustHast,
        to: toJustHast,
      }
    },

    getJustElementHast(hast: HastNode, path: Diff['path']): ElementDiff {
      const lastHast: HastNode = get(hast, path)
      if (!lastHast) return undefined
      if ('children' in lastHast) {
        const { children, ...justElementHast } = lastHast
        return justElementHast
      }
      return lastHast
    },

    getStyles(element: Element): CSSStyle[] {
      const compStyles = window.getComputedStyle(element)
      const styles = cssProperties as string[]
      return styles.map((property) => {
        const value = compStyles.getPropertyValue(property)
        return {
          property,
          value,
        }
      })
    },
  },
})
