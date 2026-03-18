export function WindowFrame({ children }: React.PropsWithChildren) {
  return (
    <main id="WindowFrame" className="laptop-lg:max-h-[96%] laptop-lg:min-h-[96%] bg-default-black max-h-[95%] min-h-[95%] overflow-hidden">
      {children}
    </main>
  )
}
