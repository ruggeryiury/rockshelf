import { RendererMessageObject } from 'rockshelf-core/lib'

export const mountMessageLocale = (msgObject: RendererMessageObject | false) => (msgObject ? `${msgObject.type}${msgObject.method.at(0)?.toUpperCase()}${msgObject.method.slice(1)}${msgObject.code ? `${msgObject.code.at(0)?.toUpperCase()}${msgObject.code.slice(1)}` : ''}` : '')
