export function WindowFrame({ children }: React.PropsWithChildren) {
  return (
    <main id="WindowFrame" className="laptop-lg:max-h-[97%] laptop-lg:min-h-[97%] bg-default-black max-h-[96%] min-h-[96%] overflow-hidden border-solid border-[#1c1c1c]" style={{ borderLeftWidth: '1px', borderRightWidth: '1px' }}>
      {children}
    </main>
  )
}
