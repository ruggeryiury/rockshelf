import { useHandler } from '../core.exports'
import { RockshelfGithubAPI, type DeluxeInstalledData } from '../lib.exports'

export const getInstalledDeluxeData = useHandler(async (win): Promise<DeluxeInstalledData | false> => await RockshelfGithubAPI.getInstalledDeluxeData())
