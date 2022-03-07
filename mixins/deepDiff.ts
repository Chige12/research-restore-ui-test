import Vue from 'vue'
import { get, has } from 'lodash'
import { fromDom } from 'hast-util-from-dom'

import { diff as justDiff } from 'just-diff'
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
  JustElementHastNode,
  EventInfo,
  CSSStyle,
  Info,
  ElementDiff,
} from './deepDiffType'
import { HastElement, HastNode } from 'hast-util-from-dom/lib'
import cssProperties from 'css-properties'

const ROOT_ELEMENT_ID = 'check-component'

export default Vue.extend<Data, Methods, {}, {}>({
  data(): Data {
    return {
      hastHistories: [],
      diffHistories: [],
      pathName: '',
      mergeIdList: [],
    }
  },

  mounted() {
    const pathName = location.pathname.replaceAll('/', '-')
    console.log(pathName)
    this.pathName = pathName
    this.setIdToAllElements(pathName)
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

  beforeDestroy(): void {
    this.createJsonFile(this.pathName)
  },

  destroyed(): void {
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
    setIdToAllElements(pathName: string) {
      const rootElement: HTMLElement | null =
        document.getElementById(ROOT_ELEMENT_ID)
      if (!rootElement) return
      rootElement.querySelectorAll('*').forEach((node, index) => {
        if (node.id) return
        const id = `ReReUiTestId${pathName}-${String(index)}-${node.tagName}`
        node.setAttribute('id', id)
      })
    },

    createHastHistory(type: EVENT_TYPES, event?: Event) {
      const rootElement: HTMLElement | null =
        document.getElementById(ROOT_ELEMENT_ID)

      if (!rootElement) {
        const text = 'Error in createHastHistory: id "check-component" is null.'
        const error: Error = { text }
        console.log(text)
        this.hastHistories.push(error)
        return
      }

      const eventInfo = this.getEventInfo(event)
      const hast = fromDom(rootElement)
      const hastHistory: HastHistory = { type, hast, eventInfo }
      this.hastHistories.push(hastHistory)
      this.createAndSaveDiff()
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
        return
      }

      const errorHistory: DiffHistory = {
        from: fromHistory,
        to: toHistory,
        diffs: null,
        diffAndInfos: null,
      }
      this.diffHistories.push(errorHistory)
    },

    createJsonFile(pathName: string) {
      const jsonHistories = JSON.stringify(this.diffHistories, null, '  ')
      const blob = new Blob([jsonHistories], {
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
        const isUnique = !this.mergeIdList.some((item) => item === id)
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
        const diffWithStyles = { ...diff, elementDiffs }
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
      const elemWithStyle = { ...elem, styles, } as ElementDiff
      return elemWithStyle
    },

    getIdFromElementDiffs(elem: ElementDiff): string | null {
      // todo: 説明変数化（なぜか変数にすると型推論が効かなくなる）
      if (!elem || !('properties' in elem) || !elem.properties) return null
      return elem.properties.id as string
    },

    checkDiffType(diff: Diff): DiffType {
      const { path } = diff
      const isClass = path.some((p) => p === 'className')
      if (isClass) return 'class'
      const isStyle = path.some((p) => p === 'style')
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

    getStyles(element: HTMLElement): CSSStyle[] {
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
