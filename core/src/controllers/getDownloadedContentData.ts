import { SongDownloadQueueAPI, useHandler } from '../core.exports'

export const getDownloadedContentData = useHandler(async () => await SongDownloadQueueAPI.getDownloadedContentData())
