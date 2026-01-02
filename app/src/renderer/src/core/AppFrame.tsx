export function AppFrame({ children }: React.PropsWithChildren) {
  return (
    <main id="AppFrame" className="min-h-[95%] max-h-[95%] overflow-y-auto!">
      {children}
    </main>
  )
}
