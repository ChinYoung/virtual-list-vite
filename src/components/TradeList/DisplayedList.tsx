import { FC, useContext } from "react"
import TradeInfo from "./TradeInfo"
import { tradeContext } from "../../context/tradeContext"

export const DisplayedList: FC = () => {
  const { toRenderList } = useContext(tradeContext)
  return <>
    {
      toRenderList.map(
        (item) => (
          <TradeInfo
            key={item.id}
            {...item}
          />
        )
      )
    }
  </>
}
