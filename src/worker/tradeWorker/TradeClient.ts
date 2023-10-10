import { debounce } from "lodash";
import { EFromWorkerMessageType, ERequestType } from "../../types/worker";
import { WsClient } from "./wsClient";
import { NoNeedToUpdateError } from "./errors";

interface ITradeClient {
  listLength: number
  containerHeight: number
  contentScrollTop: number
  totalHeight: number
  calculate(): { startIndex: number, endIndex: number, accumulateTop: number }
  dispatch(): void
}

export class TradeClient implements ITradeClient {
  private itemCount = 0
  DEFAULT_HEIGHT = 24
  private SHAKE_THRESHOLD = 600
  private REMAINING_TOP = 400
  private REMAINING_BOTTOM = 200
  private contentOffset = 0

  containerHeight = 0;
  contentScrollTop = 0;
  totalHeight = 0

  get listLength() {
    return this.itemCount
  }
  set listLength(newLength: number) {
    this.itemCount = newLength
    this.totalHeight = newLength * this.DEFAULT_HEIGHT
  }

  constructor(private wsClient: WsClient) { }

  init() {
    this.wsClient.socket?.emit(ERequestType.INIT)
  }

  updateContainerHeight(newHeight: number) {
    const changed = newHeight !== this.containerHeight
    this.containerHeight = newHeight
    changed && this.dispatch()
  }

  updateContentOffset(newOffset: number) {
    const changed = newOffset !== this.contentOffset
    this.contentOffset = newOffset
    changed && this.dispatch()
  }

  updateScrollTop(newScrollTop: number) {
    const changed = newScrollTop !== this.containerHeight
    this.contentScrollTop = newScrollTop
    changed && this.dispatch()
  }

  updateTotalCount(newCount: number) {
    const changed = newCount !== this.listLength
    this.listLength = newCount
    changed && this.dispatch()
  }

  // static height element
  private calcStaticTop(): { startIndex: number, accumulateTop: number } {
    if (this.contentScrollTop > this.SHAKE_THRESHOLD && this.contentOffset < this.SHAKE_THRESHOLD && this.contentOffset > this.REMAINING_BOTTOM) {
      throw new NoNeedToUpdateError()
    }
    let startIndex = 0
    if (this.contentScrollTop > this.SHAKE_THRESHOLD) {
      const gap = this.contentScrollTop - this.REMAINING_TOP
      startIndex = Math.floor(gap / this.DEFAULT_HEIGHT)
    }
    return {
      startIndex,
      accumulateTop: (startIndex + 2) * this.DEFAULT_HEIGHT
    }
  }

  // height of element is static
  private calcStaticBottom(): number {
    const bottomGap = this.contentScrollTop + this.containerHeight + this.SHAKE_THRESHOLD + 100
    return Math.floor(bottomGap / this.DEFAULT_HEIGHT) + 1
  }

  calculate() {
    const { startIndex, accumulateTop } = this.calcStaticTop()
    const endIndex = this.calcStaticBottom()
    return { startIndex, endIndex, accumulateTop }
  }

  async delete(tradeId: string) {
    this.wsClient.socket?.emit(ERequestType.DELETE, tradeId)
  }
  async updateRenderList(startIndex: number, endIndex: number) {
    this.wsClient.socket?.emit(ERequestType.REQUEST_RENDER_LIST, { startIndex, endIndex })
  }

  private startIndexCache = 0
  private endIndexCache = 0

  dispatch = debounce(() => {
    try {
      const { endIndex, startIndex, accumulateTop } = this.calculate()
      if (this.startIndexCache === startIndex && this.endIndexCache === endIndex) {
        return
      }
      postMessage({
        type: EFromWorkerMessageType.UPDATE_DOM,
        payload: {
          virtualOffset: startIndex > 0 ? accumulateTop : 0,
          totalHeight: this.totalHeight,
        }
      })
      this.startIndexCache = startIndex
      this.endIndexCache = endIndex
      this.updateRenderList(startIndex, endIndex)
    } catch (err) {
      if (err instanceof NoNeedToUpdateError) {
        return
      }
      throw err
    }
  }, 16)
}


