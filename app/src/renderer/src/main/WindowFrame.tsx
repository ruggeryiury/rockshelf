export function WindowFrame({ children }: React.PropsWithChildren) {
  return (
    <main id="InnerAppFrame" className="laptop-lg:max-h-[96%] laptop-lg:min-h-[96%] bg-default-black max-h-[95%] min-h-[95%] overflow-y-auto!">
      {children}
    </main>
  )
}
