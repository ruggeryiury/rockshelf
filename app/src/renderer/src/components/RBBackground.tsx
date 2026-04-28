import { animate, AnimatedDiv, AnimatedSection, sleep } from '@renderer/lib.exports'
import { useCallback, useEffect, useState } from 'react'
import { randomInt } from '../lib.exports'
import { rb3bg0, rb3bg1, rb3bg10, rb3bg11, rb3bg12, rb3bg13, rb3bg14, rb3bg15, rb3bg16, rb3bg2, rb3bg3, rb3bg4, rb3bg5, rb3bg6, rb3bg7, rb3bg8, rb3bg9 } from '@renderer/assets/images'

export function RBBackground() {
  const [imgIndex, setImgIndex] = useState(0)
  const bgs = [rb3bg0, rb3bg1, rb3bg2, rb3bg3, rb3bg4, rb3bg5, rb3bg6, rb3bg7, rb3bg8, rb3bg9, rb3bg10, rb3bg11, rb3bg12, rb3bg13, rb3bg14, rb3bg15, rb3bg16]

  useEffect(() => {
    const start = async () => {
      while (true) {
        setImgIndex((prev) => {
          const newNum = randomInt(0, 17)
          if (newNum === prev && newNum === 16) return 0
          else if (newNum === prev && newNum < 16) return newNum + 1
          else {
            if (newNum === 16) return 0
            else return newNum
          }
        })
        await sleep(5000)
        continue
      }
    }
    void start()
  }, [])
  return (
    <AnimatedSection id="RBBackground" condition={true} className="absolute! z-0 bg-black h-full w-full items-center justify-center">
      {/* {bgs.map((bg, bgI) => {
        return (
          <AnimatedDiv key={`rb3bg${bgI}`} {...animate({ opacity: true })} condition={imgIndex === bgI} className="relative! top-0 left-0">
            <img src={bg} className="bg-cover" />
          </AnimatedDiv>
        )
      })} */}
    </AnimatedSection>
  )
}
