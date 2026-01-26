export function InnerAppFrame({ children }: React.PropsWithChildren) {
  return (
    <main id="InnerAppFrame" className="max-h-[95%] min-h-[95%] overflow-y-auto!">
      {children}
    </main>
  )
}
