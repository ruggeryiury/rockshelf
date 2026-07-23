import { execAsync, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { RockshelfFileSystemAPI } from './fs/RockshelfFileSystemAPI'
import { app, dialog } from 'electron'
import { platform } from 'node:os'
import { getInternalPythonName } from '../lib.exports'

const localeTexts = {
  en: {
    pythonNotInstalledErrorTitle: 'Python v3 Not Installed',
    pythonNotInstalledError: "Python v3 can't be found installed in your system. Please, install Python v3 and try again.",
    pythonOutdatedErrorTitle: 'Outdated Python version found',
    pythonOutdatedError: 'The Python version installed in your machine is outdated. To use Rockshelf, please install Python version 3.10.0 or higher.',
  },
  es: {
    pythonNotInstalledErrorTitle: 'Python v3 Not Installed',
    pythonNotInstalledError: "Python v3 can't be found installed in your system. Please, install Python v3 and try again.",
    pythonOutdatedErrorTitle: 'Outdated Python version found',
    pythonOutdatedError: 'The Python version installed in your machine is outdated. To use Rockshelf, please install Python version 3.10.0 or higher.',
  },
  pt: {
    pythonNotInstalledErrorTitle: 'Python v3 Not Installed',
    pythonNotInstalledError: "Python v3 can't be found installed in your system. Please, install Python v3 and try again.",
    pythonOutdatedErrorTitle: 'Outdated Python version found',
    pythonOutdatedError: 'The Python version installed in your machine is outdated. To use Rockshelf, please install Python version 3.10.0 or higher.',
  },
} as const

export const checkPythonEnvVersion = async (localeKey: keyof typeof localeTexts): Promise<void> => {
  const sysPyName = await getInternalPythonName()
  const res = await execAsync(`${sysPyName} --version`)
  if (res.stderr) {
    const title = !(localeKey in localeTexts) ? localeTexts.en.pythonNotInstalledErrorTitle : localeTexts[localeKey].pythonNotInstalledErrorTitle
    const message = !(localeKey in localeTexts) ? localeTexts.en.pythonNotInstalledError : localeTexts[localeKey].pythonNotInstalledError
    dialog.showErrorBox(title, message)
    process.exit(1)
  }

  const version = res.stdout
    .trim()
    .split(' ')[1]
    .split('.')
    .map((val) => Number(val)) as [number, number, number]

  if (version[0] < 3 || (version[0] === 3 && version[1] < 10)) {
    const title = !(localeKey in localeTexts) ? localeTexts.en.pythonOutdatedErrorTitle : localeTexts[localeKey].pythonOutdatedErrorTitle
    const message = !(localeKey in localeTexts) ? localeTexts.en.pythonOutdatedError : localeTexts[localeKey].pythonOutdatedError
    dialog.showErrorBox(title, message)
    process.exit(1)
  }
}
0
export const createPythonEnv = async (userDataDirPath: DirPathLikeTypes, localeKey: keyof typeof localeTexts) => {
  const userDataDir = pathLikeToDirPath(userDataDirPath)

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

export const createPythonEnvOnUserDataDir = async () => {
  const localeKey = app.getLocale().slice(0, 2) as keyof typeof localeTexts
  const userDataDir = RockshelfFileSystemAPI.appUserDataDir()
  await checkPythonEnvVersion(localeKey)
  await createPythonEnv(userDataDir, localeKey)
}
