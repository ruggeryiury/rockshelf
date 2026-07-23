import { spawn } from 'node:child_process'

/**
 * Returns the correct python executable name across many OS'.
 * - - - -
 * @returns {Promise<'py' | 'python' | 'python3'>}
 */
export const getInternalPythonName = async (): Promise<'py' | 'python' | 'python3'> => {
  const candidates: ('py' | 'python' | 'python3')[] = process.platform === 'win32' ? ['py', 'python'] : ['python3', 'python']

  for (const exe of candidates) {
    const success = await new Promise<boolean>((resolve) => {
      const proc = spawn(exe, ['--version'])

      proc.on('error', () => resolve(false))
      proc.on('exit', (code) => resolve(code === 0))
    })

    if (success) return exe
  }

  throw new Error('Python could not be found on this system')
}
