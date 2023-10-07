import { EFromWorkerMessageType, EHeightCacheAction, EToWorkerMessageType, TFromWorkerMessage, TToWorkerMessage, TUpdateContainerHeightPayload, TUpdateContentScrollTopPayload, TUpdateHeightCachePayload, TUpdateVirtualListPayload } from "../types/worker";
import { EStatus, ETrend, TTrade } from "../types/trade";
import * as dayjs from "dayjs";
import { nanoid } from "nanoid";
import { cond, eq, partial, throttle } from "lodash";

// ====================== mock utilities============================
const MOCK_MAX_AMOUNT = 1000000
// FIXME: remove mock utilies
function randomPrice(): number {
  return parseInt(`${Math.random() * 1000}`)
}

type TThresholdVal<T> = {
  value: T,
  // the number should >= 0 and <= 1
  threshold: number
}

function randomFactory<T>(configList: TThresholdVal<T>[]) {
  const random = Math.random()
  let i = 0
  while (i < configList.length - 1 && random > configList[i].threshold) {
    i++
  }
  return configList[i].value
}

function randomTrade(index: number): TTrade {
  const now = dayjs().valueOf()
  const id = nanoid()
  return {
    id: id,
    index,
    name: id,
    createAt: now,
    price: randomPrice(),
    lastPrice: randomPrice(),
    status: randomFactory([{ threshold: 0.5, value: EStatus.VALID }, { threshold: 1, value: EStatus.INVALID }]),
    symbol: 'RMB',
    trader: 'random',
    trend: randomFactory([{ threshold: 0.33, value: ETrend.DOWN }, { threshold: 0.66, value: ETrend.STEADY }, { threshold: 1, value: ETrend.UP }]),
    updateAt: now
  }
}
// ======================end of mock utilities============================

interface ITradeClient<T> {
  listLength: number
  containerHeight: number
  contentScrollTop: number
  totalHeight: number
  heightCache: number[]
  calculate(): TFromWorkerMessage<EFromWorkerMessageType.UPDATE_VIRTUAL_LIST, TUpdateVirtualListPayload<T>>
  dispatch(): void
}

class TradeClient implements ITradeClient<TTrade> {
  private itemCount = 0
  private DEFAULT_HEIGHT = 24
  private SHAKE_THRESHOLD = 100
  private fullList: TTrade[] = []

  containerHeight = 0;
  contentScrollTop = 0;
  heightCache: number[] = [];
  totalHeight = 0

  get listLength() {
    return this.itemCount
  }
  set listLength(newLength: number) {
    this.itemCount = newLength
    this.heightCache = Array.from({ length: newLength }).map(() => this.DEFAULT_HEIGHT)
  }

  updateContainerHeight(newHeight: number) {
    const changed = newHeight !== this.containerHeight
    this.containerHeight = newHeight
    changed && this.dispatch()
  }

  updateScrollTop(newScrollTop: number) {
    const changed = newScrollTop !== this.containerHeight
    this.contentScrollTop = newScrollTop
    changed && this.dispatch()
  }

  constructor() {
    // TODO: update data by WS client
    this.fullList = Array.from({ length: MOCK_MAX_AMOUNT }).map((_k, _v) => randomTrade(_v))
    this.listLength = this.fullList.length
    this.totalHeight = this.fullList.length * this.DEFAULT_HEIGHT
    this.heightCache = this.fullList.map(() => this.DEFAULT_HEIGHT)
  }

  // TODO: the way to store & update height cache
  updateHeightCache(payload: TUpdateHeightCachePayload) {
    const delta = payload.height - this.DEFAULT_HEIGHT
    cond([
      [partial(eq, EHeightCacheAction.ADD), () => this.totalHeight += delta],
      [partial(eq, EHeightCacheAction.REMOVE), () => this.totalHeight -= delta]
    ])(payload.action)
  }

  // height of element is dynamic
  private calcDynamicTop(): { startIndex: number, accumulateTop: number } {
    let accumulateTop = 0
    let startIndex = 0
    if (this.contentScrollTop > this.SHAKE_THRESHOLD) {
      for (let i = 0; i < this.listLength; i++) {
        accumulateTop = accumulateTop + this.heightCache[i]
        if (this.contentScrollTop - accumulateTop <= this.SHAKE_THRESHOLD) {
          startIndex = i
          break
        }
      }
    }
    return {
      startIndex,
      accumulateTop
    }
  }

  // height of element is dynamic
  private calcDynamicBottom(): number {
    let endIndex = 0
    let accumulateBottom = 0
    for (let i = 0; i < this.listLength; i++) {
      accumulateBottom = accumulateBottom + this.heightCache[i]
      endIndex = i
      if (accumulateBottom >= this.contentScrollTop + this.containerHeight + this.SHAKE_THRESHOLD) {
        break
      }
    }
    return endIndex
  }

  // height of element is static
  private calcStaticTop(): { startIndex: number, accumulateTop: number } {
    let startIndex = 0
    if (this.contentScrollTop > this.SHAKE_THRESHOLD) {
      const gap = this.contentScrollTop - this.SHAKE_THRESHOLD
      startIndex = Math.floor(gap / this.DEFAULT_HEIGHT)
    }
    return {
      startIndex,
      accumulateTop: startIndex * this.DEFAULT_HEIGHT
    }
  }

  // height of element is static
  private calcStaticBottom(): number {
    const bottomGap = this.contentScrollTop + this.containerHeight + this.SHAKE_THRESHOLD
    return Math.floor(bottomGap / this.DEFAULT_HEIGHT) + 1
  }



  calculate(): TFromWorkerMessage<EFromWorkerMessageType, TUpdateVirtualListPayload<TTrade>> {
    const { startIndex, accumulateTop } = this.calcStaticTop()
    const endIndex = this.calcStaticBottom()
    return {
      type: EFromWorkerMessageType.UPDATE_VIRTUAL_LIST,
      payload: {
        toRenderList: this.fullList.slice(startIndex, endIndex + 1),
        virtualOffset: startIndex > 0 ? accumulateTop : 0,
        totalHeight: this.totalHeight
      }
    }
  }

  // dispatch = throttle(() => {
  //   postMessage(this.calculate())
  // }, 16)
  dispatch() {
    postMessage(this.calculate())
  }
}



(() => {
  const client = new TradeClient()
  onmessage = (ev: MessageEvent<TToWorkerMessage<EToWorkerMessageType, TUpdateContainerHeightPayload | TUpdateContentScrollTopPayload | TUpdateHeightCachePayload>>) => {
    const { type, payload } = ev.data
    cond([
      [partial(eq, EToWorkerMessageType.UPDATE_CONTAINER_HEIGHT), () => {
        const newHeight = payload as TUpdateContainerHeightPayload
        client.updateContainerHeight(newHeight)
      }],
      [partial(eq, EToWorkerMessageType.UPDATE_CONTENT_SCROLL_TOP), () => {
        const newScrollTop = payload as TUpdateContentScrollTopPayload
        client.updateScrollTop(newScrollTop)
      }],
      // [partial(eq, EToWorkerMessageType.UPDATE_HEIGHT_CACHE), () => {
      //   const heightDetail = payload as TUpdateHeightCachePayload
      //   client.updateHeightCache(heightDetail)
      // }],
    ])(type)
  }

  client.dispatch()
})()