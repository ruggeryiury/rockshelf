import { spawn } from 'node:child_process'
import { platform } from 'node:os'
import { execAsync } from 'node-lib'
import { dialog } from 'electron'
import { CLIAPI } from './CLIAPI'
import { RockshelfFileSystemAPI } from './RockshelfFileSystemAPI'
import { RockshelfLocaleAPI } from './RockshelfLocaleAPI'

export type OSPythonNames = 'py' | 'python' | 'python3'

/**
 * A class with static methods that checks and creates Rockshelf's exclusive Python environment.
 */
export class RockshelfPythonServiceAPI {
  /**
   * Returns the executable name for Python on a specific operating system.
   * - - - -
   * @returns {Promise<OSPythonNames>}
   */
  static async getInternalPythonExeName(): Promise<OSPythonNames> {
    const candidates: OSPythonNames[] = process.platform === 'win32' ? ['py', 'python'] : ['python3', 'python']

    for (const exe of candidates) {
      const success = await new Promise<boolean>((resolve) => {
        const proc = spawn(exe, ['--version'])

        proc.on('error', () => resolve(false))
        proc.on('exit', (code) => resolve(code === 0))
      })

      if (success) return exe
    }

    throw new Error('Python v3 could not be found installed on this system.')
  }

  /**
   * Checks the installed Python version on the machine Rockshelf's executing.
   */
  static async checkInstalledPythonVersion(): Promise<void> {
    const sysPyName = await this.getInternalPythonExeName()
    const res = await execAsync(`${sysPyName} --version`)
    if (res.stderr) {
      const title = RockshelfLocaleAPI.t('pythonNotInstalledErrorTitle')
      const message = RockshelfLocaleAPI.t('pythonNotInstalledError')
      dialog.showErrorBox(title, message)
      CLIAPI.exit(1)
    }

    const version = res.stdout
      .trim()
      .split(' ')[1]
      .split('.')
      .map((val) => Number(val)) as [number, number, number]

    if (version.length !== 3) {
      const title = RockshelfLocaleAPI.t('pythonOutdatedErrorTitle')
      const message = RockshelfLocaleAPI.t('pythonOutdatedError')
      dialog.showErrorBox(title, message)
      CLIAPI.exit(1)
    }
    if (version[0] < 3 || (version[0] === 3 && version[1] < 10)) {
      const title = RockshelfLocaleAPI.t('pythonOutdatedErrorTitle')
      const message = RockshelfLocaleAPI.t('pythonOutdatedError')
      dialog.showErrorBox(title, message)
      CLIAPI.exit(1)
    }
  }
  /**
   * Creates a Python environment for exclusive Rockshelf use on Rockshelf user data folder.
   */
  static async init(): Promise<void> {
    const userDataDir = RockshelfFileSystemAPI.appUserDataDir()

    const pythonMainDir = RockshelfFileSystemAPI.pythonEnvDir()
    const pyExecName = platform() === 'win32' ? 'py' : 'python3'
    const pythonExeFile = RockshelfFileSystemAPI.pythonEnvScriptFile()
    const pythonScriptPath = RockshelfFileSystemAPI.pythonEnvScriptDir()

    if (pythonMainDir.exists && !pythonExeFile.exists) await pythonMainDir.deleteDir(true)
    if (!pythonMainDir.exists || !pythonExeFile.exists) {
      await execAsync(`${pyExecName} -m venv Python`, { cwd: userDataDir.path })
      await execAsync(`python.exe -m pip install -r "${RockshelfFileSystemAPI.coreModuleRootDir().gotoFile('bin/python/requirements.txt').path}"`, { cwd: pythonScriptPath.path })
    }
  }
}
