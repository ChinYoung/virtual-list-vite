export enum EToWorkerMessageType {
  UPDATE_CONTAINER_HEIGHT = 1,
  UPDATE_CONTENT_SCROLL_TOP,
  UPDATE_HEIGHT_CACHE,
}

export enum EFromWorkerMessageType {
  UPDATE_VIRTUAL_LIST = 1000,
}

export enum EHeightCacheAction {
  ADD = 'add',
  REMOVE = 'remove'
}

export type TUpdateContainerHeightPayload = number
export type TUpdateContentScrollTopPayload = number
export type TUpdateHeightCachePayload = {
  id: string
  height: number
  action: EHeightCacheAction
}

export type TToWorkerMessage<T, P> = {
  type: T
  payload: P
}

export type TUpdateVirtualListPayload<T> = {
  virtualOffset: number
  totalHeight: number
  toRenderList: T[]
}

export type TFromWorkerMessage<T, P> = {
  type: T
  payload: P
}
