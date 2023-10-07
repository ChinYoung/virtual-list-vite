import { createContext } from "react"
import { TTrade } from "../types/trade"

export type TTradeContext = {
  totalHeight: number
  contentScrollTop: number
  updateTotalHeight: (newHeight: number) => void
  updateContentScrollTop: (newScrollTop: number) => void
  toRenderList: TTrade[]
}
export const tradeContext = createContext<TTradeContext>({
  contentScrollTop: 0,
  totalHeight: 0,
  updateTotalHeight: () => { },
  updateContentScrollTop: () => { },
  toRenderList: [],
})
