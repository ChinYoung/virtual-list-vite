import { cond, eq, partial } from "lodash"
import { EResponseType, EFromWorkerMessageType, EToWorkerMessageType, TToWorkerMessage, TToWorkerPayload, TUpdateContainerHeightPayload, TUpdateContentScrollTopPayload, TDeleteTradePayload } from "../../types/worker"
import { TradeClient } from "./TradeClient"
import { WsClient } from "./wsClient"

(() => {
  const wsClient = new WsClient()
  wsClient.connect()
  const tradeClient = new TradeClient(wsClient)
  onmessage = (ev: MessageEvent<TToWorkerMessage<EToWorkerMessageType, TToWorkerPayload>>) => {
    const { type, payload } = ev.data
    cond([
      [partial(eq, EToWorkerMessageType.UPDATE_CONTAINER_HEIGHT), () => {
        const newHeight = payload as TUpdateContainerHeightPayload
        tradeClient.updateContainerHeight(newHeight)
      }],
      [partial(eq, EToWorkerMessageType.UPDATE_CONTENT_SCROLL_TOP), () => {
        const newScrollTop = payload as TUpdateContentScrollTopPayload
        tradeClient.updateScrollTop(newScrollTop)
      }],
      [partial(eq, EToWorkerMessageType.DELETE_TRADE), () => {
        tradeClient.delete(payload as TDeleteTradePayload)
      }],
      [partial(eq, EToWorkerMessageType.UPDATE_CONTENT_OFFSET), () => {
        tradeClient.updateContentOffset(payload as number)
      }],
    ])(type)
  }
  // wsClient.socket?.on(EResponseType.SYNC_TRADES, (ev) => {
  //   const { updated, added, deleted } = ev
  //   idbUpdate(updated)
  //   idbInsert(added)
  //   idbDelete(deleted)
  // })
  wsClient.socket?.on(EResponseType.UPDATE_TOTAL_COUNT, ev => {
    tradeClient.updateTotalCount(ev)
  })
  wsClient.socket?.on(EResponseType.RESPONSE_RENDER_LIST, ({ trades }) => {
    postMessage({
      type: EFromWorkerMessageType.UPDATE_VIRTUAL_LIST,
      payload: {
        toRenderList: trades,
      }
    })
  })
  tradeClient.init()
  tradeClient.dispatch()
})()
