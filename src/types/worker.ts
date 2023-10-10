// ========================To worker message==============================
export enum EToWorkerMessageType {
  UPDATE_CONTAINER_HEIGHT = 1,
  UPDATE_CONTENT_SCROLL_TOP,
  UPDATE_CONTENT_OFFSET,
  UPDATE_HEIGHT_CACHE,
  DELETE_TRADE,
  HIGHLIGHT_TRADE,
}

export enum EHeightCacheAction {
  ADD = 'add',
  REMOVE = 'remove'
}

export type TUpdateContainerHeightPayload = number
export type TUpdateContentScrollTopPayload = number
export type TDeleteTradePayload = string
export type THighlightTradePayload = string
export type TUpdateHeightCachePayload = {
  id: string
  height: number
  action: EHeightCacheAction
}

export type TToWorkerPayload = TUpdateContainerHeightPayload
  | TUpdateContentScrollTopPayload
  | TUpdateHeightCachePayload
  | TDeleteTradePayload
  | THighlightTradePayload

export type TToWorkerMessage<T extends EToWorkerMessageType, P extends TToWorkerPayload> = {
  type: T
  payload: P
}


// ========================From worker message==============================
export enum EFromWorkerMessageType {
  UPDATE_VIRTUAL_LIST = 1000,
  UPDATE_DOM,
}
export type TUpdateVirtualListPayload<T> = {
  toRenderList: T[]
}

export type TUpdateDomPayload = {
  virtualOffset: number
  totalHeight: number
}

export type TFromWorkerPayload<T = never> = TUpdateVirtualListPayload<T> | TUpdateDomPayload

type ToInfer<T> = T extends TFromWorkerPayload<infer X> ? X : never

export type TFromWorkerMessage<T extends EFromWorkerMessageType, P extends TFromWorkerPayload<ToInfer<P>>> = {
  type: T
  payload: P
}

export enum ERequestType {
  REQUEST_RENDER_LIST = 'request-render-list',
  DELETE = 'delete',
  INIT = 'init'
}

// ========================Response message==============================
export enum EResponseType {
  SYNC_TRADES = 'sync-trades',
  UPDATE_TOTAL_COUNT = 'update-total-count',
  RESPONSE_RENDER_LIST = 'response-render-list'
}

