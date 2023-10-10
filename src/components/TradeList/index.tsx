import { FC, createRef, useContext, useEffect } from "react"
import { tradeContext } from "../../context/tradeContext"
import { DisplayedList } from "./DisplayedList"

export type VirtualListItemRender<T> = FC<T>

const TradeList: FC = () => {
  const { virtualOffset, updateContentTop, totalHeight } = useContext(tradeContext)
  const contentRef = createRef<HTMLDivElement>()

  const container = createRef<HTMLDivElement>()
  const {
    updateContainerHeight,
    updateContentScrollTop,
    loading,
    updateContainerTop
  } = useContext(tradeContext)

  // update container height
  useEffect(() => {
    if (!container.current) {
      return
    }
    const { height, top } = container.current.getBoundingClientRect()
    updateContainerHeight(height)
    updateContainerTop(top)
  }, [container, updateContainerHeight, updateContainerTop])
  // add scroll listener to update scroll top
  useEffect(() => {
    const scrollEventHandler = (ev: Event) => {

      const el = ev.target as HTMLDivElement
      updateContentScrollTop(el.scrollTop)
      if (!contentRef.current) {
        return
      }
      const rect = contentRef.current.getBoundingClientRect()
      const { top } = rect
      updateContentTop(top)
      // loading()
    }
    const el = container.current
    el?.addEventListener('scroll', scrollEventHandler)
    return () => el?.removeEventListener('scroll', scrollEventHandler)
  }, [container, contentRef, loading, updateContentScrollTop, updateContentTop])

  return (
    // the view port container
    <div ref={container} className="w-full h-full overflow-y-scroll px-4 py-4 rounded-lg overflow-hidden bg-[#ccc]">
      {/* the content container */}
      <div style={{ height: `${totalHeight}px` }}>
        {/* content */}
        <div ref={contentRef} style={{ transform: `translateY(${virtualOffset}px)` }}>
          <DisplayedList />
        </div>
      </div>
    </div>

  )
}

export default TradeList
