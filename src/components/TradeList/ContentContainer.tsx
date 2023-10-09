import { FC, PropsWithChildren, useContext } from "react";
import { tradeContext } from "../../context/tradeContext";

export const ContentContainer: FC<PropsWithChildren> = ({ children }) => {
  const { totalHeight } = useContext(tradeContext)
  return <div style={{ height: `${totalHeight}px` }}>
    {children}
  </div>
}