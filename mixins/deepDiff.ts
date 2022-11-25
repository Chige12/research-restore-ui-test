import { HastNode } from 'hast-util-from-dom/lib'
import { diff as justDiff } from 'just-diff'
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  reactive,
} from 'vue'
import { EVENT, EventInfo, EVENT_TYPES } from '~/types/event'
import { JsonFile } from '~/utils/jsonFilesType'
import {
  addStylesFromDiffAndInfos,
  createDiffAndInfos,
  getIdFromElementDiffs,
} from '~/utils/recording/diff'
import {
  DiffAndInfos,
  DiffHistory,
  HastHistory,
} from '~/utils/recording/diffTypes'
import { setIdToAllElements } from '~/utils/recording/elements'
import { getAllElementStylesAndId } from '~/utils/recording/styles'
import { saveJsonFile } from '~/utils/saveJsonFile'
import { Data } from './deepDiffType'

const ROOT_ELEMENT_ID = 'check-component'

const delay = (n: number) => new Promise((r) => setTimeout(r, n * 1000))

export default defineComponent({
  setup() {
    const state = reactive<Data>({
      rootElement: null,
      hastHistories: [],
      diffHistories: [],
      pathName: '',
      mergeIdList: [],
      allElementStylesPerDiff: [],
      allElementStyleDiffs: [],
    })

    onMounted(() => {
      const rootElement = document.getElementById(ROOT_ELEMENT_ID)
      if (!rootElement) {
        console.log('Error! not exist root element!')
        return
      }

      state.pathName = location.pathname.replaceAll('/', '-')
      state.rootElement = rootElement
      setIdToAllElements(state.pathName, rootElement)
      state.allElementStylesPerDiff.push(getAllElementStylesAndId(rootElement))
      createHastHistory(EVENT.First)
      addEventListener()
    })

    onBeforeUnmount(() => {
      createJsonFile(state.pathName)
    })

    onUnmounted(() => {
      removeEventListener()
    })

    const addEventListener = () => {
      window.addEventListener('click', click, false)
      window.addEventListener('keydown', keydown, false)
    }

    const removeEventListener = () => {
      window.removeEventListener('click', click, false)
      window.removeEventListener('keydown', keydown, false)
    }

    const click = (e: Event) => {
      console.log('click!')
      createHastHistory(EVENT.CLICK, e)
    }
    const keydown = (e: Event) => {
      console.log('keydown!')
      createHastHistory(EVENT.KEY, e)
    }

    const fromDom = async (element: Element): Promise<HastNode> => {
      const module = await import('hast-util-from-dom')
      return module.fromDom(element)
    }

    const createHastHistory = async (type: EVENT_TYPES, event?: Event) => {
      const { hastHistories, allElementStylesPerDiff } = state

      await delay(1)

      const rootElement = document.getElementById(ROOT_ELEMENT_ID)
      if (!rootElement) {
        console.log('Error in createHastHistory: id "check-component" is null.')
        return
      }
      const pathName = location.pathname.replaceAll('/', '-')
      setIdToAllElements(pathName, rootElement)

      const eventInfo = await getEventInfo(event)
      const hast = await fromDom(rootElement)
      const hastHistory: HastHistory = { type, hast, eventInfo }
      hastHistories.push(hastHistory)
      createAndSaveDiff()
      allElementStylesPerDiff.push(getAllElementStylesAndId(rootElement))
    }

    const getEventInfo = async (
      event?: Event
    ): Promise<EventInfo | undefined> => {
      const target = event ? event.target : null
      const isTarget = target instanceof HTMLElement
      if (event && target && isTarget) {
        const element = target as HTMLElement
        const eventHast = await fromDom(element)
        const eventId = element.id
        return {
          event,
          type: event.type,
          eventHast,
          eventId,
        }
      }
      return undefined
    }

    const createAndSaveDiff = () => {
      const { hastHistories: hasts, diffHistories } = state
      const fromHistory = hasts[hasts.length - 2] as HastHistory
      const toHistory = hasts[hasts.length - 1] as HastHistory

      const canCreateDiff =
        fromHistory && 'hast' in fromHistory && toHistory && 'hast' in toHistory

      if (canCreateDiff) {
        const diffHistory = createDiffHistory(fromHistory, toHistory)
        diffHistories.push(diffHistory)
        console.log('SAVE DONE!')
        return
      }

      diffHistories.push({
        from: fromHistory,
        to: toHistory,
        diffs: null,
        diffAndInfos: null,
      })
      console.log('SAVE DONE! (can not create diff)')
    }

    const createDiffHistory = (
      from: HastHistory,
      to: HastHistory
    ): DiffHistory => {
      const diffs = justDiff(from.hast, to.hast)
      const diffAndInfos = createDiffAndInfos(diffs, from.hast, to.hast)
      // CSSのclass配列のdiffを順不同で検証したいので、同じidのDOMが存在する場合マージする
      const uniqueDiffAndInfos = createUniqueDiffAndInfos(diffAndInfos)
      const diffAndInfoWithStyles =
        addStylesFromDiffAndInfos(uniqueDiffAndInfos)

      return {
        from,
        to,
        diffs,
        diffAndInfos: diffAndInfoWithStyles,
      }
    }

    const createUniqueDiffAndInfos = (
      diffAndInfos: DiffAndInfos
    ): DiffAndInfos => {
      return diffAndInfos.filter((diff) => {
        if (diff.type !== 'class') return true
        const elem = diff.elementDiffs?.to
        const id = getIdFromElementDiffs(elem)
        if (!id) return true
        const isUnique = !state.mergeIdList.includes(id)
        if (isUnique) {
          state.mergeIdList.push(id)
          return true
        }
        return false
      })
    }

    const createJsonFile = (pathName: string) => {
      const obj: JsonFile = {
        diffHistories: state.diffHistories,
        allElementStylesPerDiff: state.allElementStylesPerDiff,
      }
      const name = `diffHistories${pathName}`
      saveJsonFile(obj, name)
    }
  },
})
