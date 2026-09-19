import { type BrowserWindow } from 'electron'
import { FilePath, type FilePathJSONRepresentation } from 'node-lib'

export interface ErrorHandlerFilePointer {
	fnName: string
	path: FilePathJSONRepresentation
	line: number
	col: number
}

export interface ErrorHandlerObject {
	message: string
	name: string
	cause: unknown
	stackMessage?: string
	stack?: ErrorHandlerFilePointer[]
}

/**
 * A class with methods to send serialized error objects from the main process to the renderer.
 */
export class ErrorHandler {
	/**
	 * Creates an object of stack traces pointers from an Error thrown by the main process to be displayed on the renderer.
	 * - - - -
	 * @param {Error} error The error instance to be serialized.
	 * @returns {NonNullable<ErrorHandlerObject['stack']> | undefined}
	 */
	static createErrorHandlerValues(error: Error): NonNullable<ErrorHandlerObject['stack']> | undefined {
		if (!error.stack) return

		const pointers: ErrorHandlerFilePointer[] = []

		const allLines = error.stack
			.split('\n')
			.map((val) => val.trim())
			.filter((val, i) => {
				if (i === 0) return false
				if (val.toLowerCase().startsWith('at session') || val.toLowerCase().startsWith('at async session') || val.toLowerCase().startsWith('at file:///') || val.toLowerCase().startsWith('at async file:///')) return false
				if (val.toLowerCase().includes('electron/handler.js')) return false
				return true
			})

		for (const errLine of allLines) {
			const [_, fn, fp] = errLine.split(' ').filter((val) => val !== 'async')
			const [__, fileDrive, filePath, line, col] = fp.slice(1, -1).split(':')

			const filePathObj = FilePath.of(fileDrive.replace(/\//g, '') + ':' + filePath)

			pointers.push({ fnName: fn, path: filePathObj.toJSON(), line: Number(line), col: Number(col) })
		}
		return pointers
	}

	/**
	 * Send a serialized error object to the renderer. This is only called inside the [addHandler](../electron/handler.ts) hook logic when catching errors from any handler.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {Error} error The error instance to be serialized.
	 */
	static send(win: BrowserWindow, error: Error): void {
		win.webContents.send('sendError', {
			message: error.message,
			name: error.name,
			cause: error.cause,
			stackMessage: error.stack,
			stack: this.createErrorHandlerValues(error),
		} satisfies ErrorHandlerObject)
	}
}
