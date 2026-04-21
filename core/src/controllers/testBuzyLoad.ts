import { sendBuzyLoad, useHandler } from '../core.exports'
import { sleep } from '../lib.exports'

export const testBuzyLoad = useHandler(async (win) => {
  sendBuzyLoad(win, { code: 'init', steps: ['Testing Step 1', 'Testing Step 2', 'Testing Step 3', 'Testing Step 4 (Will give Error)'], title: 'Testing Buzy Load Components' })

  await sleep(1500)
  sendBuzyLoad(win, { code: 'incrementStep' })

  await sleep(2500)
  sendBuzyLoad(win, { code: 'incrementStep' })
  sendBuzyLoad(win, { code: 'subtext', key: 'helloUserText', messageValues: { user: 'Ruggery' } })
  await sleep(2500)
  sendBuzyLoad(win, { code: 'subtext', key: 'helloUserText', messageValues: { user: 'Iury' } })
  await sleep(2500)
  sendBuzyLoad(win, { code: 'subtext', key: 'helloUserText', messageValues: { user: 'Motta' } })
  await sleep(2500)
  sendBuzyLoad(win, { code: 'subtext', key: 'helloUserText', messageValues: { user: 'Corrêa' } })
  await sleep(2500)
  sendBuzyLoad(win, { code: 'subtext', key: 'helloUserText', messageValues: { user: 'Andrade' } })

  await sleep(3000)
  sendBuzyLoad(win, { code: 'incrementStep' })
  await sleep(3000)
  sendBuzyLoad(win, { code: 'throwError', key: 'ohno', messageValues: { user: 'Shit' } })

  return true
})
