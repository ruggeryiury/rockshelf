import { addHandler } from './core'
import { winClose, winMaximize, winMinimize } from './lib'

export function initMainHandlers() {
  addHandler('@TopBar/minimize', winMinimize)
  addHandler('@TopBar/maximize', winMaximize)
  addHandler('@TopBar/close', winClose)
}

export * from './core'
export * from './lib'
