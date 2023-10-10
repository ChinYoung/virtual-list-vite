import { createContext } from "react"
import { TTrade } from "../types/trade"
import { TDeleteTradePayload, THighlightTradePayload, TUpdateContainerHeightPayload, TUpdateContentScrollTopPayload } from "../types/worker"

export type TTradeContext = {
  totalHeight: number
  virtualOffset: number
  toRenderList: (TTrade & { highlighted: boolean })[]
  isLoading: boolean
  updateContainerHeight(newHeight: TUpdateContainerHeightPayload): void
  updateContainerTop(newHeight: TUpdateContainerHeightPayload): void
  updateContentTop(newHeight: TUpdateContainerHeightPayload): void
  updateContentScrollTop(newScrollTop: TUpdateContentScrollTopPayload): void
  deleteTrade(tradeId: TDeleteTradePayload): void
  toggleHighlight(tradeId: THighlightTradePayload): void
  isHighlighted(tradeId: string): boolean
  loading(): void
  endLoading(): void
}
export const tradeContext = createContext<TTradeContext>({
  totalHeight: 0,
  virtualOffset: 0,
  toRenderList: [],
  isLoading: false,
  updateContainerHeight() { },
  updateContainerTop() { },
  updateContentTop() { },
  updateContentScrollTop() { },
  deleteTrade() { },
  toggleHighlight() { },
  isHighlighted() { return false },
  loading() { },
  endLoading() { }
})
