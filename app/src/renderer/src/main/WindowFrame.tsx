export function WindowFrame({ children }: React.PropsWithChildren) {
  return (
    <main id="InnerAppFrame" className="max-h-[95%] min-h-[95%] overflow-y-auto! bg-default-black">
      {children}
    </main>
  )
}
