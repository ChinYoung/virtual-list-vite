import { FC, useContext } from "react"
import { Container } from "./Container"
import { ContentContainer } from "./ContentContainer"
import { tradeContext } from "../../context/tradeContext"
import { DisplayedList } from "./DisplayedList"

export type VirtualListItemRender<T> = FC<T>

const TradeList: FC = () => {
  const { virtualOffset } = useContext(tradeContext)

  return (
    // the container
    <Container>
      <ContentContainer>
        {/* content root */}
        <div style={{ transform: `translateY(${virtualOffset}px)` }}>
          <DisplayedList />
        </div>
      </ContentContainer>
    </Container>
  )
}

export default TradeList