export function AppFrame({ children }: React.PropsWithChildren) {
  return (
    <main id="AppFrame" className="max-h-[95%] min-h-[95%] overflow-y-auto!">
      {children}
    </main>
  )
}
