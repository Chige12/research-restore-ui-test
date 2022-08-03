import { HastNode } from 'hast-util-from-dom/lib'

export const EVENT = {
  First: 'first',
  CLICK: 'click',
  KEY: 'key',
} as const

export type EVENT_TYPES = typeof EVENT[keyof typeof EVENT]

export type EventInfo = {
  event: Event
  type: string
  eventHast: HastNode
  eventId: string
}
