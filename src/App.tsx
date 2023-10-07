import './App.css'
import VirtualList from './components/VirtualList'
import { nanoid } from 'nanoid'
import { EStatus, ETrend, TTrade } from './types/trade'
import * as dayjs from "dayjs";
import TradeInfo from './components/TradeInfo'


function randomPrice(): number {
  return parseInt(`${Math.random() * 10000}`)
}

function randomTrade(): TTrade {
  const now = dayjs().valueOf()
  const id = nanoid()
  return {
    id: id,
    name: id,
    createAt: now,
    price: randomPrice(),
    lastPrice: randomPrice(),
    status: EStatus.VALID,
    symbol: 'RMB',
    trader: 'random',
    trend: ETrend.STEADY,
    updateAt: now
  }
}

function App() {
  const list: Array<TTrade> = Array.from({ length: 10000 }).map(() => randomTrade())
  return (
    <div className="text-center bg-gray-300 border border-blue-300 w-screen h-screen flex justify-center items-center">
      <div className='w-full h-full p-4'>
        <VirtualList<TTrade> list={list} render={TradeInfo} />
      </div>
    </div >
  )
}

export default App
