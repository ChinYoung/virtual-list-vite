import { FC, PropsWithChildren, useCallback, useRef, useState } from "react"
import { TTradeContext, tradeContext } from "../context/tradeContext"
import { useEffect } from 'react';
import TradeWorker from "../worker/tradeClient?worker";
import { EFromWorkerMessageType, EToWorkerMessageType, TFromWorkerMessage, TToWorkerMessage, TUpdateContainerHeightPayload, TUpdateContentScrollTopPayload, TUpdateHeightCachePayload, TUpdateVirtualListPayload } from "../types/worker";
import { TTrade } from "../types/trade";
import { cond, debounce, eq, partial } from "lodash";

const REFRESH_RATE = 8

function getSender() {
  return debounce((worker: Worker, message: TToWorkerMessage<EToWorkerMessageType, TUpdateContainerHeightPayload | TUpdateContentScrollTopPayload | TUpdateHeightCachePayload>) => {
    if (!worker) {
      return
    }
    worker.postMessage(message)
    cond
  }, REFRESH_RATE)
}

export const TradeContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const worker = useRef<Worker>()
  const containerHeightSender = useRef(getSender())
  const scrollTopSender = useRef(getSender())
  const heightCacheSender = useRef(getSender())

  const [virtualOffset, setVirtualOffset] = useState<TTradeContext['virtualOffset']>(0)
  const [totalHeight, setTotalHeight] = useState<TTradeContext['totalHeight']>(0)
  const [toRenderList, setToRenderList] = useState<TTradeContext['toRenderList']>([])


  const updateContainerHeight = useCallback<TTradeContext['updateContainerHeight']>((newHeight) => {
    worker.current && containerHeightSender.current(worker.current, {
      type: EToWorkerMessageType.UPDATE_CONTAINER_HEIGHT,
      payload: newHeight
    } as TToWorkerMessage<EToWorkerMessageType.UPDATE_CONTAINER_HEIGHT, TUpdateContainerHeightPayload>)
  }, [])

  const updateContentScrollTop = useCallback<TTradeContext['updateContentScrollTop']>((newScrollTop) => {
    worker.current && scrollTopSender.current(worker.current, {
      type: EToWorkerMessageType.UPDATE_CONTENT_SCROLL_TOP,
      payload: newScrollTop
    } as TToWorkerMessage<EToWorkerMessageType.UPDATE_CONTENT_SCROLL_TOP, TUpdateContentScrollTopPayload>)
  }, [])

  const updateHeightCache = useCallback<TTradeContext['updateHeightCache']>((payload) => {
    worker.current && heightCacheSender.current(worker.current, {
      type: EToWorkerMessageType.UPDATE_HEIGHT_CACHE,
      payload: payload
    } as TToWorkerMessage<EToWorkerMessageType.UPDATE_HEIGHT_CACHE, TUpdateHeightCachePayload>)
  }, [])

  useEffect(() => {
    const tradeWorker = new TradeWorker()
    tradeWorker.onmessage = (ev: MessageEvent<TFromWorkerMessage<EFromWorkerMessageType, TUpdateVirtualListPayload<TTrade>>>) => {
      const { payload, type } = ev.data
      cond([
        [partial(eq, EFromWorkerMessageType.UPDATE_VIRTUAL_LIST), () => {
          const { toRenderList, virtualOffset, totalHeight: newHeight } = payload
          setVirtualOffset(virtualOffset)
          setToRenderList(toRenderList)
          setTotalHeight(newHeight)
        }]
      ])(type)
    }
    worker.current = tradeWorker
    return () => {
      tradeWorker.terminate()
      worker.current = undefined
    }
  }, [])
  return <tradeContext.Provider value={{
    totalHeight,
    virtualOffset,
    toRenderList,
    updateContainerHeight,
    updateContentScrollTop,
    updateHeightCache,
  }}>
    {children}
  </tradeContext.Provider>
}
