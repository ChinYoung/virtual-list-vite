import { FC, createRef, useContext, useEffect, useMemo } from "react";
import { ETrend, TTrade } from "../types/trade";
import { tradeContext } from "../context/tradeContext";
import { EHeightCacheAction } from "../types/worker";
import dayjs from "dayjs";
import { cond, constant, eq, partial } from "lodash";



const TradeInfo: FC<TTrade> = (props) => {
  const { id, createAt } = props
  const ref = createRef<HTMLDivElement>()
  const isNew = useMemo(() => (dayjs().valueOf() - createAt) < 1000, [createAt])
  const { updateHeightCache } = useContext(tradeContext)
  useEffect(() => {
    if (!ref.current) {
      return
    }
    const height = ref.current.clientHeight
    updateHeightCache({ height, id, action: EHeightCacheAction.ADD })
  }, [id, ref, updateHeightCache])
  return (
    isNew ? (
      <div ref={ref} className="px-4 flex justify-evenly items-center gap-4 h-8 bg-Trade-New">
        <RowContent val={props} />
      </div >
    ) : (
      <div ref={ref} className="px-4 flex justify-evenly items-center gap-4 h-8 bg-Trade-Default">
        <RowContent val={props} />
      </div >
    )
  )
}

const RowContent: FC<{ val: TTrade }> = ({ val: { id, index, name, lastPrice, price, status, symbol, trader, trend, createAt, updateAt } }) => {
  return <>
    <div className="flex justify-start items-center">{index}</div>
    <div className="flex-1 flex justify-start items-center">{id}</div>
    <div className="flex-1 flex justify-start items-center">{name}</div>
    <div className="flex justify-start items-center">{lastPrice}</div>
    <div className="flex justify-start items-center">{price}</div>
    <div className="flex justify-start items-center">{status}</div>
    <div className="flex justify-start items-center">{symbol}</div>
    <div className="flex justify-start items-center">{trader}</div>
    <Trend trend={trend} />
    <div className="flex justify-start items-center">{createAt}</div>
    <div className="flex justify-start items-center">{updateAt}</div>
  </>
}

const Trend: FC<{ trend: ETrend }> = ({ trend }) => {
  const mark = cond([
    [partial(eq, ETrend.UP), constant('↑')],
    [partial(eq, ETrend.STEADY), constant('–')],
    [partial(eq, ETrend.DOWN), constant('↓')],
  ])(trend)
  return <div className="flex justify-start items-center">{mark}</div>

}




export default TradeInfo