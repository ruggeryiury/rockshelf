import { RhythmverseSongDownload, useHandler } from '../core.exports'

export const getDownloadedContentData = useHandler(async () => await RhythmverseSongDownload.getDownloadedContentData())
