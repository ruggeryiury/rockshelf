import type { RendererMessageObject } from 'rockshelf-core'

export const mountMessageLocaleKey = (msgObject: RendererMessageObject | null) => (msgObject ? `${msgObject.type}${msgObject.method.at(0)?.toUpperCase()}${msgObject.method.slice(1)}${msgObject.code ? `${msgObject.code.at(0)?.toUpperCase()}${msgObject.code.slice(1)}` : ''}` : '')
