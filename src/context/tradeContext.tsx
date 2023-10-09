import { createContext } from "react"
import { TTrade } from "../types/trade"
import { TUpdateContainerHeightPayload, TUpdateContentScrollTopPayload, TUpdateHeightCachePayload } from "../types/worker"

export type TTradeContext = {
  totalHeight: number
  virtualOffset: number
  toRenderList: TTrade[]
  updateContainerHeight(newHeight: TUpdateContainerHeightPayload): void
  updateContentScrollTop(newScrollTop: TUpdateContentScrollTopPayload): void
  updateHeightCache(heightDetail: TUpdateHeightCachePayload): void
}
export const tradeContext = createContext<TTradeContext>({
  totalHeight: 0,
  virtualOffset: 0,
  toRenderList: [],
  updateContainerHeight() { },
  updateContentScrollTop() { },
  updateHeightCache() { },
})
