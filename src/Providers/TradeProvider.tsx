import { FC, PropsWithChildren, useCallback, useRef, useState } from "react"
import { TTradeContext, tradeContext } from "../context/tradeContext"
import { useEffect } from 'react';
import TradeWorker from "../worker/tradeWorker?worker";
import { EFromWorkerMessageType, EToWorkerMessageType, TDeleteTradePayload, TFromWorkerMessage, TFromWorkerPayload, TToWorkerMessage, TUpdateContainerHeightPayload, TUpdateContentScrollTopPayload, TUpdateDomPayload, TUpdateVirtualListPayload } from "../types/worker";
import { TTrade } from "../types/trade";
import { cond, eq, partial } from "lodash";

export const TradeContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const worker = useRef<Worker>()

  const [virtualOffset, setVirtualOffset] = useState<TTradeContext['virtualOffset']>(0)
  const [totalHeight, setTotalHeight] = useState<TTradeContext['totalHeight']>(0)
  const [containerTop, setContainerTop] = useState<number>(0)
  const [contentTop, setContentTop] = useState<number>(0)
  const [toRenderList, setToRenderList] = useState<TTradeContext['toRenderList']>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const highlightMap = useRef(new Map())

  const updateContainerHeight = useCallback<TTradeContext['updateContainerHeight']>((newHeight) => {
    worker.current && worker.current.postMessage({
      type: EToWorkerMessageType.UPDATE_CONTAINER_HEIGHT,
      payload: newHeight
    } as TToWorkerMessage<EToWorkerMessageType.UPDATE_CONTAINER_HEIGHT, TUpdateContainerHeightPayload>)
  }, [])

  const updateContentScrollTop = useCallback<TTradeContext['updateContentScrollTop']>((newScrollTop) => {
    worker.current && worker.current.postMessage({
      type: EToWorkerMessageType.UPDATE_CONTENT_SCROLL_TOP,
      payload: newScrollTop
    } as TToWorkerMessage<EToWorkerMessageType.UPDATE_CONTENT_SCROLL_TOP, TUpdateContentScrollTopPayload>)
  }, [])

  const deleteTrade = useCallback<TTradeContext['deleteTrade']>((payload) => {
    worker.current && worker.current.postMessage({
      type: EToWorkerMessageType.DELETE_TRADE,
      payload
    } as TToWorkerMessage<EToWorkerMessageType.DELETE_TRADE, TDeleteTradePayload>)
  }, [])

  const isHighlighted = useCallback((tradeId: string) => !!highlightMap.current.get(tradeId), [])

  const toggleHighlight = useCallback<TTradeContext['toggleHighlight']>((payload) => {
    highlightMap.current.set(payload, !highlightMap.current.get(payload))
    setToRenderList(toRenderList.map(_i => ({ ..._i, highlighted: isHighlighted(_i.tradeId) })))
  }, [isHighlighted, toRenderList])

  const loading = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 10000);
  }, [])
  const endLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const updateContainerTop = useCallback<TTradeContext['updateContainerTop']>((newTop) => {
    setContainerTop(newTop)
    worker.current && worker.current.postMessage({
      type: EToWorkerMessageType.UPDATE_CONTENT_OFFSET,
      payload: containerTop - contentTop
    })
  }, [containerTop, contentTop])
  const updateContentTop = useCallback<TTradeContext['updateContentTop']>((newTop) => {
    setContentTop(newTop)
    worker.current && worker.current.postMessage({
      type: EToWorkerMessageType.UPDATE_CONTENT_OFFSET,
      payload: containerTop - contentTop
    })
  }, [containerTop, contentTop])

  useEffect(() => {
    const tradeWorker = new TradeWorker()
    tradeWorker.onmessage = (ev: MessageEvent<TFromWorkerMessage<EFromWorkerMessageType, TFromWorkerPayload<TTrade>>>) => {
      const { payload, type } = ev.data
      cond([
        [
          partial(eq, EFromWorkerMessageType.UPDATE_VIRTUAL_LIST), () => {
            const { toRenderList } = payload as TUpdateVirtualListPayload<TTrade>
            setToRenderList(toRenderList.map(_i => ({ ..._i, highlighted: isHighlighted(_i.tradeId) })))
            endLoading()
          }
        ],
        [
          partial(eq, EFromWorkerMessageType.UPDATE_DOM), () => {
            const { totalHeight, virtualOffset } = payload as TUpdateDomPayload
            setTotalHeight(totalHeight)
            setVirtualOffset(virtualOffset)
          }
        ]
      ])(type)
    }
    worker.current = tradeWorker
    return () => {
      tradeWorker.terminate()
      worker.current = undefined
    }
  }, [endLoading, isHighlighted])
  return <tradeContext.Provider value={{
    totalHeight,
    virtualOffset,
    toRenderList,
    isLoading,
    updateContainerHeight,
    updateContentScrollTop,
    deleteTrade,
    toggleHighlight,
    isHighlighted,
    loading,
    endLoading,
    updateContainerTop,
    updateContentTop,
  }}>
    {children}
  </tradeContext.Provider>
}
