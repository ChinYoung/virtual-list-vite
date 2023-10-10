import { FC, createRef, useCallback, useContext, useMemo, useState } from "react";
import { TTrade } from "../../types/trade";
import dayjs from "dayjs";
import { cond, constant, eq, gt, lt, partial } from "lodash";
import { TTradeContext, tradeContext } from "../../context/tradeContext";
import loadingImg from "../../assets/loading.gif";



const TradeInfo: FC<TTrade & { highlighted: boolean }> = (props) => {
  const { createdAt, highlighted } = props
  const ref = createRef<HTMLDivElement>()
  const { deleteTrade, toggleHighlight, isLoading } = useContext(tradeContext)

  const bgColor = useMemo(() => {
    if (highlighted) {
      return '#0af'
    }
    if (dayjs().valueOf() - dayjs(createdAt).valueOf() < 10000) {
      return '#0f0'
    }
    return 'rgba(0,0,0,0)'
  }, [createdAt, highlighted])
  return (
    <div ref={ref} className="relative px-4 flex justify-evenly items-center gap-4 h-8 bg-Trade-New overflow-visible" style={{ backgroundColor: bgColor }}>
      <RowContent val={props} deleteTrade={deleteTrade} toggleHighlight={toggleHighlight} isLoading={isLoading} />
    </div >
  )
}

export const RowContent: FC<{
  val: TTrade & { highlighted: boolean },
  deleteTrade: TTradeContext['deleteTrade'],
  toggleHighlight: TTradeContext['toggleHighlight'],
  isLoading: boolean
}> = ({
  val: { id, tradeId, name, trader, prevPrice, price, status, symbol, highlighted },
  isLoading,
  deleteTrade,
  toggleHighlight
}) => {
  const [isShowMenu, setIsShowMenu] = useState<boolean>(false)
  const showMenu = useCallback(() => {
    setIsShowMenu(true)
  }, [])
  const hideMenu = useCallback(() => {
    setIsShowMenu(false)
  }, [])
  return <>
    <div className="flex justify-start items-center">{!isLoading ? id : <img src={loadingImg} />}</div>
    <div className="flex-1 flex justify-start items-center">{!isLoading ? name : <img src={loadingImg} />}</div>
    <div className="flex justify-start items-center">{!isLoading ? symbol : <img src={loadingImg} />}</div>
    <div className="flex-1 flex justify-start items-center">{!isLoading ? trader : <img src={loadingImg} />}</div>
    <div className="flex-1 flex justify-start items-center">{!isLoading ? parseFloat(prevPrice) === 0 ? 0 : Number(prevPrice).toFixed(4) : <img src={loadingImg} />}</div>
    <div className="flex-1 flex justify-start items-center">{!isLoading ? Number(price).toFixed(4) : <img src={loadingImg} />}</div>
    {!isLoading ? <Trend prevPrice={prevPrice} price={price} /> : <img src={loadingImg} />}
    <div className="flex justify-start items-center">{!isLoading ? status : <img src={loadingImg} />}</div>
    <div onClick={showMenu} className="cursor-pointer">
      ...
    </div>
    {
      isShowMenu && (
        <div className="h-18 absolute right-0 top-0 bg-green-400 z-10 rounded overflow-hidden outline" onMouseLeave={hideMenu}>
          <div className="h-8 px-2 py-1 hover:bg-lime-500 cursor-pointer" onClick={() => deleteTrade(tradeId)}>delete</div>
          <div className="h-8 px-2 py-1 hover:bg-lime-500 cursor-pointer" onClick={() => toggleHighlight(tradeId)}>{highlighted ? 'revoke-highlight' : 'highlight'}</div>
        </div>
      )
    }
  </>
}

const Trend: FC<{ prevPrice: string, price: string }> = ({ prevPrice, price }) => {
  const trend = parseFloat(prevPrice) === 0 ? 0 : parseFloat(price) - parseFloat(prevPrice)
  const mark = cond([
    [partial(gt, 0), constant('↑')],
    [partial(eq, 0), constant('–')],
    [partial(lt, 0), constant('↓')],
  ])(trend)
  return <div className="flex justify-start items-center">{mark}</div>

}

export default TradeInfo
