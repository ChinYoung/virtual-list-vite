import * as dayjs from "dayjs";

type PatchMessage = {
  id: string
  time: number
  totalHeight: number
  virtualOffset: number
}

class TradeClient {
  constructor() {
    console.log('inited');
  }

  dispatch(): void {
    console.log("🚀 ~ file: tradeClient.ts:13 ~ TradeClient ~ dispatch ~ dispatch:")
  }
}

onmessage = (e) => {
  console.log("🚀 ~ file: tradeClient.ts:8 ~ e:", e)
}

(() => {
  new TradeClient()
})()