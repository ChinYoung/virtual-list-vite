import { FC, PropsWithChildren, createRef, useContext, useEffect } from "react"
import { tradeContext } from "../../context/tradeContext"

export const Container: FC<PropsWithChildren> = ({ children }) => {
  const container = createRef<HTMLDivElement>()
  const {
    updateContainerHeight,
    updateContentScrollTop
  } = useContext(tradeContext)

  // update container height
  useEffect(() => {
    if (!container.current) {
      return
    }
    updateContainerHeight(container.current.clientHeight)
  }, [container, updateContainerHeight])

  // add scroll listener to update scroll top
  useEffect(() => {
    const scrollEventHandler = (ev: Event) => {
      const el = ev.target as HTMLDivElement
      updateContentScrollTop(el.scrollTop)
    }
    const el = container.current
    el?.addEventListener('scroll', scrollEventHandler)
    return () => el?.removeEventListener('scroll', scrollEventHandler)
  }, [container, updateContentScrollTop])

  return (
    <div ref={container} className="w-full h-full overflow-y-scroll px-4 py-2">
      {children}
    </div>
  )
}