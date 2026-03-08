/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: {
    readonly [K in never]: string
  }
  export default classes
}
