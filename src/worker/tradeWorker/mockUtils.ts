import * as dayjs from "dayjs";
import { nanoid } from "nanoid";
import { EStatus, ETrend, TTrade } from "../../types/trade";

export const MOCK_MAX_AMOUNT = 1000

export function randomPrice(): number {
  return parseInt(`${Math.random() * 1000}`)
}

export type TThresholdVal<T> = {
  value: T,
  // the number should >= 0 and <= 1, ts can not limit the range of value now
  threshold: number
}

export function randomFactory<T>(configList: TThresholdVal<T>[]) {
  const random = Math.random()
  let i = 0
  while (i < configList.length - 1 && random > configList[i].threshold) {
    i++
  }
  return configList[i].value
}

export function randomTrade(index: number): TTrade {
  const now = dayjs().valueOf()
  const id = nanoid()
  return {
    id: id,
    index,
    name: id,
    createdAt: now,
    price: randomPrice(),
    lastPrice: randomPrice(),
    status: randomFactory([{ threshold: 0.5, value: EStatus.VALID }, { threshold: 1, value: EStatus.INVALID }]),
    symbol: 'RMB',
    trader: 'random',
    trend: randomFactory([{ threshold: 0.33, value: ETrend.DOWN }, { threshold: 0.66, value: ETrend.STEADY }, { threshold: 1, value: ETrend.UP }]),
    updatedAt: now
  }
}
