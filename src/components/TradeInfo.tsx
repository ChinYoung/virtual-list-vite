import { forwardRef } from "react";
import { TTrade } from "../types/trade";



const TradeInfo = forwardRef<HTMLDivElement, TTrade>(({
  id,
  name,
  lastPrice,
  price,
  status,
  symbol,
  trader,
  trend,
  createAt,
  updateAt
}, ref) =>
  <div ref={ref} className="flex justify-evenly items-center gap-4 h-8">
    <div className="flex-1 flex justify-start items-center">{id}</div>
    <div className="flex-1 flex justify-start items-center">{name}</div>
    <div className="flex justify-start items-center">{lastPrice}</div>
    <div className="flex justify-start items-center">{price}</div>
    <div className="flex justify-start items-center">{status}</div>
    <div className="flex justify-start items-center">{symbol}</div>
    <div className="flex justify-start items-center">{trader}</div>
    <div className="flex justify-start items-center">{trend}</div>
    <div className="flex justify-start items-center">{createAt}</div>
    <div className="flex justify-start items-center">{updateAt}</div>
  </div>
)

export default TradeInfo