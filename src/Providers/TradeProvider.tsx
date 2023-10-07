import { FC, PropsWithChildren, useCallback, useState } from "react"
import { TTradeContext, tradeContext } from "../context/tradeContext"

export const TradeContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [totalHeight, setTotalHeight] = useState<TTradeContext['totalHeight']>(0)
  const [contentScrollTop, setContentScrollTop] = useState<TTradeContext['contentScrollTop']>(0)
  const updateTotalHeight = useCallback<TTradeContext['updateTotalHeight']>((newHeight) => {
    setTotalHeight(newHeight)
  }, [])
  const updateContentScrollTop = useCallback<TTradeContext['updateContentScrollTop']>((newScrollTop) => {
    setContentScrollTop(newScrollTop)
  }, [])
  const [toRenderList] = useState<TTradeContext['toRenderList']>([])
  return <tradeContext.Provider value={{
    totalHeight,
    contentScrollTop,
    updateTotalHeight,
    updateContentScrollTop,
    toRenderList
  }}>
    {children}
  </tradeContext.Provider>
}
