import { sum } from "lodash"
import { ForwardRefExoticComponent, RefAttributes, createRef, useEffect, useMemo, useRef, useState } from "react"

export type VirtualListItem<T> = ForwardRefExoticComponent<T & RefAttributes<HTMLDivElement>>

function VirtualList<T extends { id: string }>({ list, render }: { list: T[], render: VirtualListItem<T> }) {
  const SHAKE_THRESHOLD = 100
  const DEFAULT_CHILD_HEIGHT = 30
  const ChildDom = render

  const container = createRef<HTMLDivElement>()
  const contentRoot = createRef<HTMLDivElement>()
  const childrenRef = useRef<(HTMLDivElement | null)[]>()

  const [heightCache, setHeightCache] = useState<number[]>(Array.from({ length: list.length }).map(() => DEFAULT_CHILD_HEIGHT))

  const [containerHeight, setContainerHeight] = useState<number>(0)
  const [contentScrollTop, setContentScrollTop] = useState<number>(0)

  const [virtualOffset, setVirtualOffset] = useState<number>(0)
  const [startIndex, setStartIndex] = useState<number>(0)
  const [endIndex, setEndIndex] = useState<number>(0)

  const totalHeight = useMemo(() => sum(heightCache), [heightCache])
  const toRenderList = useMemo(() => list.slice(startIndex, endIndex + 1), [endIndex, list, startIndex])

  // render elements should be displayed
  useEffect(() => {
    let accumulateTop = 0
    let startIndex = 0
    let endIndex = 0
    if (contentScrollTop > SHAKE_THRESHOLD) {
      for (let i = 0; i < list.length; i++) {
        accumulateTop = accumulateTop + heightCache[i]
        if (contentScrollTop - accumulateTop <= SHAKE_THRESHOLD) {
          startIndex = i
          break
        }
      }
    }
    let accumulateBottom = 0
    for (let i = 0; i < list.length; i++) {
      accumulateBottom = accumulateBottom + heightCache[i]
      endIndex = i
      if (accumulateBottom >= contentScrollTop + containerHeight + SHAKE_THRESHOLD) {
        break
      }
    }
    setStartIndex(startIndex)
    setEndIndex(endIndex)
    // TODO: calculate the "render offset" of the 'threshold' element
    setVirtualOffset(startIndex > 0 ? accumulateTop : 0)
  }, [containerHeight, contentScrollTop, heightCache, list.length])

  // find elements with different height and update content container height
  useEffect(() => {
    const newCache = heightCache.slice(0, list.length)
    let hasDifferent = false
    childrenRef.current?.forEach((el, index) => {
      if (!el) {
        return
      }
      const isDifferent = el.clientHeight !== newCache[startIndex + index]
      hasDifferent = hasDifferent || isDifferent
      isDifferent && (newCache[startIndex + index] = el.clientHeight)
    })
    // update only when there is any different, or it may result in infinite loop
    hasDifferent && setHeightCache(newCache)
  }, [heightCache, startIndex, list.length])

  // update container height
  useEffect(() => {
    if (!container.current) {
      return
    }
    setContainerHeight(container.current.clientHeight)
  }, [container])

  // add scroll listener
  useEffect(() => {
    const scrollEventHandler = (ev: Event) => {
      const el = ev.target as HTMLDivElement
      setContentScrollTop(el.scrollTop)
    }
    const el = container.current
    el?.addEventListener('scroll', scrollEventHandler)
    return () => el?.removeEventListener('scroll', scrollEventHandler)
  }, [container])

  return (
    // the container
    <div ref={container} className="w-full h-full overflow-y-scroll px-4 py-2">
      {/* content container */}
      <div style={{ height: `${totalHeight}px` }}>
        {/* content root */}
        <div ref={contentRoot} style={{ transform: `translateY(${virtualOffset}px)` }}>
          {
            toRenderList.map(
              (item, index) => <ChildDom
                key={item.id}
                ref={(el) => childrenRef.current ? (childrenRef.current![index] = el) : (childrenRef.current = [el])}
                {...item}
              />)
          }
        </div>
      </div>
    </div >
  )
}

export default VirtualList