import { DirPath, type DirPathLikeTypes } from 'node-lib'
import { isRPCS3Devhdd0PathValid } from '../../lib.exports'

export type SongPackageCodeTypes = 'tu5' | 'rb1' | 'rb2' | 'rb3' | 'lego' | 'tbrb' | 'gdrb' | 'rb3ToRB2' | 'rb3ToBlitz' | 'rb3Beta' | 'rbb' | 'rb4' | 'rb4r' | 'rbvr' | 'rbdlc1' | 'rbdlc2' | 'rbdlc3' | 'rbdlc4' | 'rbdlc5' | 'rbdlc6' | 'rbdlc7' | 'rbdlc8' | 'rbdlc9' | 'rbdlc10' | 'rb3dlc1' | 'rb3dlc2' | 'rb3dlc3' | 'rb3dlc4' | 'rb3dlc5' | 'rb4dlc1' | 'rb4dlc2' | 'rb4dlc3' | 'rb4dlc4' | 'rb4dlc5' | 'rb4dlc6' | 'tbrbDLC' | 'lostRBDLC' | 'rbnPack1' | 'rbnPack2' | 'rbnPack3' | 'rbnPack4' | 'rbnPack5' | 'rbnPack6' | 'rbnPack7' | 'rbn2Pack1' | 'rbn2Pack2' | 'rbn2Pack3' | 'rbn2Pack4' | 'rbn2Pack5' | 'rbn2Pack6' | 'rbn2Pack7' | 'rbn2Pack8' | 'rbn2Pack9' | 'lostRBN1' | 'lostRBN2'

export interface OfficialSongPackageStats {
  /**
   * The name of the package (in English).
   */
  name: string
  /**
   * A string code that can be used as a package identifier.
   */
  code: SongPackageCodeTypes
  /**
   * Tells if the package is outdated.
   */
  outdated?: boolean
  /**
   * The original folder name in the USRDIR folder.
   */
  folderName: string
  /**
   * The game where the contents must be extracted.
   *
   * - `"rb1"` - BLUS-30050
   * - `"rb3"` - BLUS-30463
   * - `"tbrb"` - BLUS-30282
   */
  packageType: 'rb1' | 'rb3' | 'tbrb'
  /**
   * An object with known hashes of specific packages.
   */
  hashes: {
    /**
     * SHA256 hash of the extracted contents as RPCS3's content.
     */
    extractedRPCS3: string
    /**
     * `SHA256 hash of the PKG container file entries.`
     */
    pkg: string
    /**
     * SHA1 hash of the STFS container file entries.
     */
    stfs: string
  }

  // Flags
  /**
   * If `true`, this package is a port of Rock Band 3 on-disc songs to any other Rock Band titles.
   */
  isDuplicatedForRB3?: boolean
}

export type OfficialPackagesHashTypes = keyof OfficialSongPackageStats['hashes']

export const officialPackages: OfficialSongPackageStats[] = [
  {
    name: 'Title Update 5',
    code: 'tu5',
    folderName: 'gen',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '',
      pkg: 'cba38dc92d6b7327e0a4c6efb014f3269d183ba475fce6d863b33d2178d28778',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 1',
    code: 'rb1',
    folderName: 'RB1FULLEXPORTPS3',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'dfb3bd3a8b9060f853be063906947b705695e90b7301e2504e73e5f96bb05bff',
      pkg: 'e386b8ab41e844ff087400533920cccca99c4fe3d455756bab35223592b0e683',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 2',
    code: 'rb2',
    folderName: 'RB2-Rock-Band-2-Export',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '72afb485363fba9bbbf7e92e570e796c2245a0cb82d3081e1a88290a306c154d',
      pkg: '92462fe7347aa14446b5b38409c7a91c48564fd4932d76e0b4e83a52fb3ca5ce',
      stfs: '',
    },
  },
  {
    name: 'LEGO Rock Band',
    code: 'lego',
    folderName: 'LEGO-Rock-Band-Export',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'e1fd2a120c3ddb3352fee74b99247b939734f23fa9ef5a6d2a2608e50c35a9b4',
      pkg: '7b76d701a8513dd7a2a50065d34d0eb0b10aee4980e0ae6814baeb43f3caae87',
      stfs: '',
    },
  },
  {
    name: 'The Beatles: Rock Band',
    code: 'tbrb',
    folderName: 'TheBeatlesRockBand',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: 'fa11c956b9a20c6dfbd40037f8931b4eebd00eab37b5cecb194396196a75a603',
      pkg: 'e9dc7c631ab5abeb9acdc8d5314a5c40c9cf81402e007378a4a32043058cc03c',
      stfs: '',
    },
  },
  {
    name: 'Green Day: Rock Band',
    code: 'gdrb',
    folderName: 'Green-Day-Rock-Band-Export',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'cbf9e908f9ace1ffa3c566264b1fdeb8c361be59e2096f2d5e6a16b39c022475',
      pkg: 'c4d8ecfb9a192c3bdba390f1bac799260a0cf5fcdededceb059abea23ad6fbca',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 3 (to RB2)',
    code: 'rb3ToRB2',
    folderName: 'RB3-to-RB2-DISC',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'cd3f8eb9736e36b13884dd13fa68a7e97da67a8f06549e638f181c189d977ed2',
      pkg: 'b919ddd11ed5a9e399119805d0a4a7904f2a09b2f2c030e0c79741a817fa8a0e',
      stfs: '',
    },
    isDuplicatedForRB3: true,
  },
  {
    name: 'Rock Band 3 (to Blitz)',
    code: 'rb3ToBlitz',
    folderName: 'RB3-Rock-Band-3-Export',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '146eb95cfc53662e7384c792f4fa5a2c64cda7a77f3dd8de2915b7f9525f75b6',
      pkg: '548091726f960589e5f3a180754ab702643d77ec752bc17ea211689628661a86',
      stfs: '',
    },
    isDuplicatedForRB3: true,
  },
  {
    name: 'Rock Band 3 Beta Songs',
    code: 'rb3Beta',
    folderName: 'RB3BetaSongs',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '580e45e1733ee8b997243bcf5fe4b86e530ceb896a022df022b19502a1fda1a3',
      pkg: 'df60d01b226d3d94ebc78fed44199040e551fbb96280ddd964b59d88bc0e077b',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Blitz',
    code: 'rbb',
    folderName: 'Rock-Band-Bltz-Export',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: 'af63279a693e585ef95a70794db1bdb2b0f30f6559835ae07284a711dc7f838c',
      pkg: 'e10d0362d06128ba7111a4bc16369c6c2c8044c4ec2a298bf78a45d30e7c6c0e',
      stfs: '',
    },
  },

  // #region RB4
  {
    name: 'Rock Band 4',
    code: 'rb4',
    folderName: 'RB4-to-RB2-DISC',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '95042a20e3533c245567a9a83116e40fa76f512cd0e82bc0fe2dbe1c45e8595e',
      pkg: 'bcec0a387334d58ca23c7048bc7be99c02fb00bd68230d0c61bed79299743539',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 4 Rivals',
    code: 'rb4r',
    folderName: 'RB4-to-RB2-RIVALS',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: 'bca83294fb5a5f95d484b6918932cc049d07018e460fcb4611b8ca1fc12df1b8',
      pkg: '94a1da8caf9006771c87b14d9d6412a676293a9c80c01d55723d3378d09a0e36',
      stfs: '',
    },
  },

  // #region Rock Band VR
  {
    name: 'Rock Band VR',
    code: 'rbvr',
    folderName: 'RBVREXCLUSIVES-to-RB2',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '834f26860ab0892d47d3c2a32b54a06997f3efe88efe7770e10cf6cee2c3a0c6',
      pkg: '028efbc1af4972b2df6bda1dafdfd7c6079ef18ae736fb4a15d8870e3b6408a6',
      stfs: '',
    },
  },

  // #region RB DLC
  {
    name: 'Rock Band DLC Pack 01',
    code: 'rbdlc1',
    folderName: 'RB1DLCPACK01OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'fdfd08204608b155c919bf48cb3079733bdb74aaf4c93edebf32f36219becd21',
      pkg: '09b366ffd83d1952ceb0bb45a27e990773109ffeffc590118075a43d786a65f6',
      stfs: '',
    },
  },
  {
    name: 'Rock Band DLC Pack 02',
    code: 'rbdlc2',
    folderName: 'RB1DLCPACK02OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '155b3d86d6fb59690aea29426ff930a937f00bbe2972ebc068e621cf94b1f59b',
      pkg: 'c7759d3d82d396e393e627db77a6622f295e32533740ec9f12f76f82fcd346d0',
      stfs: '',
    },
  },
  {
    name: 'Rock Band DLC Pack 03',
    code: 'rbdlc3',
    folderName: 'RB1DLCPACK03OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'e5592142b98710dd8b29ffecd5fcb0175b581f368f1b0a26cb8591daadbd8ff7',
      pkg: '523d2ed8ea9844f33fb2a8eff6ea46763262b075b279a14048551f66826f036d',
      stfs: '',
    },
  },
  {
    name: 'Rock Band DLC Pack 04',
    code: 'rbdlc4',
    folderName: 'RB1DLCPACK04OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '5e265b7a9b262a4e162d1e116785c1a9d53057eaa34339dbfdbd7d8c1a8cb1d1',
      pkg: '663694ac425f4c63729258d8f2bbfa3486ee5c2dbf9ead8e98bdec6e70769bb6',
      stfs: '',
    },
  },
  {
    name: 'Rock Band DLC Pack 05',
    code: 'rbdlc5',
    folderName: 'RB1DLCPACK05OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'd35e60e383892499587fa35b6fb6af760e8b0113e00de948fea70f70ba0c044c',
      pkg: '6e72d18e8df87a435a0adaecb962a4948f1c4b2b3249839082016b1a77c19c40',
      stfs: '',
    },
  },
  {
    name: 'Rock Band DLC Pack 06',
    code: 'rbdlc6',
    folderName: 'RB1DLCPACK06OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '23662412fd40e215637f3c179eba7ab76394641a8bc67b3dc093e06c1d4d794f',
      pkg: '7eea3b38eed30405c59075e8ddbb0aec9625946ce32a47f061cca8d89ea15eb3',
      stfs: '',
    },
  },
  {
    name: 'Rock Band DLC Pack 07',
    code: 'rbdlc7',
    folderName: 'RB1DLCPACK07OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '6fddd079928b0aa8ae39ee67d8698429c8fe546c1880924877d9cfe78d645296',
      pkg: '3c39a7433e9d5475382c7f1f09bbd1d20062fcdeed503c7153a2af3d588e5470',
      stfs: '',
    },
  },
  {
    name: 'Rock Band DLC Pack 08',
    code: 'rbdlc8',
    folderName: 'RB1DLCPACK08OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'd446b7663ef6dde4d46f7b64d270aab74fb1c66a01d873c48d7e2e5348b0fd9f',
      pkg: 'e6615d2bf62527faf0ac6afc123462bfcbab1a6d5a0671f51cd2cb63db7cf936',
      stfs: '',
    },
  },
  {
    name: 'Rock Band DLC Pack 09',
    code: 'rbdlc9',
    folderName: 'RB1DLCPACK09OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'a0651dd1c52d419ba7dc16012a765833bdeebab99de6ccdb4465bfbb20c5afba',
      pkg: '48acc7f212aa3460647846ad31899948649817ea7c48c421914a93c23e69feee',
      stfs: '',
    },
  },
  {
    name: 'Rock Band DLC Pack 10',
    code: 'rbdlc10',
    folderName: 'RB1DLCPACK10OF10',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '902166c43337d232d6b7b2f8e6ddb0ffce7fc51d316b11956b94c6b0040d289b',
      pkg: '8bed8148d3882dcde72403d90cbf56371bda267698608729695cc1417a6fdec2',
      stfs: '',
    },
  },

  // #region RB3 DLC
  {
    name: 'Rock Band 3 DLC Pack 01',
    code: 'rb3dlc1',
    folderName: 'RB3DLCPACK01OF05',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '42b271c039f0b50b4cfc0c2b1f89ea7bac78595076e41047702bf04af7d7ce1b',
      pkg: '4ff83da2b9e1e7e045894f1c8573538782d6315f2d4de12804e5c7b811c4d28f',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 3 DLC Pack 02',
    code: 'rb3dlc2',
    folderName: 'RB3DLCPACK02OF05',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '7db93c7abe86185881a11dccafa67faf178898d05b8bfcfa1bbbcdb8e4f74baf',
      pkg: '81cfbad95157af8b1ea2f0ee46d4ecf70125c29a47f38778cd4cf3927fd4ba42',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 3 DLC Pack 03',
    code: 'rb3dlc3',
    folderName: 'RB3DLCPACK03OF05',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '15a8a9da7e9063742c2aa2f5362762f0af3fc691a25b0ea5af86a39a71543db7',
      pkg: 'a5bb6f17ab9239a1eb78e07bf5b2b66bccf5bba28920a3c6b1ec75feef89b231',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 3 DLC Pack 04',
    code: 'rb3dlc4',
    folderName: 'RB3DLCPACK04OF05',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '71a8063f9db38e970365f1c7ee4406a077f42aa1d2383d648398e9a7cad312eb',
      pkg: '5357d7690c56c61752c55006898201652b5c455893957374507fa73dc0f63ab5',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 3 DLC Pack 05',
    code: 'rb3dlc5',
    folderName: 'RB3DLCPACK05OF05',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: 'c16eeea984e761325e71e60f255c19ed5caa8b6d11a34816e8cb5955a8c4610e',
      pkg: 'b2f715fb7ebe8b893cac9c13c8b1ec7da8803395c879f48299086465d84ca47d',
      stfs: '',
    },
  },

  // #region RB4 DLC
  {
    name: 'Rock Band 4 DLC Pack 01',
    code: 'rb4dlc1',
    folderName: 'RB4-to-RB2-DLC-1',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '54e12c7a116b6879d38c202223c406e40f1877d36f574764b3eaada7b28980ba',
      pkg: 'ad5e6f3a03152ccb0dddd2a78a68cb240ef3985880a8252ec54fa1da4e00dbe4',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 4 DLC Pack 02',
    code: 'rb4dlc2',
    folderName: 'RB4-to-RB2-DLC-2',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '89d844ad39199d33d05f08a8085cc82797cc0e7bdc99cae6ec7cd74e7bd788c0',
      pkg: '68bfc0fe61a8961780c5b65ff05f8ee894391ffe07ecf0781375cd2dd6d9227d',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 4 DLC Pack 03',
    code: 'rb4dlc3',
    folderName: 'RB4-to-RB2-DLC-3',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '77b4deb8119592eda4af908910dc0d4c944514cb9adaadf2b97d7b997f6184e1',
      pkg: '6b07dc4a812c26e71120ce62c41ecd6cc77b5781300b6051f83d52bcb361a802',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 4 DLC Pack 04',
    code: 'rb4dlc4',
    folderName: 'RB4-to-RB2-DLC-4',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '4c0d31fd1c94d325ae31659cd62fe02e2fc890fa764b69e714c3f4e57edc6e6b',
      pkg: '16a9ff93b938ae95d2397dbd2b645a9d10808dc528481373a299da249c3b77f2',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 4 DLC Pack 05',
    code: 'rb4dlc5',
    folderName: 'RB4-to-RB2-DLC-5',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'a2072784a716eec438f54813c7078018379e7c3442226a6334cebe5bf360592a',
      pkg: 'eb8d1d89f3cd7e349865199a69666c7ce4c6186d40aab1f277a0b043f975667d',
      stfs: '',
    },
  },
  {
    name: 'Rock Band 4 DLC Pack 06',
    code: 'rb4dlc6',
    folderName: 'RB4-to-RB2-DLC-6',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '84410d128030566821f82191b76bd14c0b12eba04685550de2c92becb0177c0f',
      pkg: '141d10d08fe7e789455f9726a06aa6edb4f1c023e390bd80b4e378ea7cd10876',
      stfs: '',
    },
  },

  // // #region The Beatles DLC
  // {
  //   name: 'The Beatles: Rock Band DLC',
  //   code: 'tbrbDLC',
  //   folderName: 'The-Beatles-Rock-Band-DLC',
  //   packageType: 'tbrb',
  //   hashes: {
  //     extractedRPCS3: '',
  //     pkg: '742b327ad99b560ba5780bac5aa6c93fa38305cfcaf84d0bd26f79ed160993c8',
  //     stfs: '',
  //   },
  // },

  // #region Lost RB DLC
  {
    name: 'Lost Rock Band DLC',
    code: 'lostRBDLC',
    folderName: 'LostRBDLC',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'b4dc19c15e2d13dec7a3aa95e3051dc96014822bdcd74fb8c0263a11fbc43d0a',
      pkg: '88c1ba98be08eeee7c8adcd88014a3d3adbe3569c34ed966f4f7d9b5b8d9ca6c',
      stfs: '',
    },
  },

  // #region RBN 1.0
  {
    name: 'Rock Band Network 1.0 Pack 01',
    code: 'rbnPack1',
    folderName: 'O591465RB2RBNPACK01OF07',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'a34f1cb68e3320dc3104e28668e747db43d7f015b8b262e420e02e0011066784',
      pkg: '43e978baa70aaa7bd0befdff3f1fabfe7428a8c5934d96cad2ad0b51d46b53ec',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 1.0 Pack 02',
    code: 'rbnPack2',
    folderName: 'O304373RB2RBNPACK02OF07',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '3dddd9660d6f68e0b38ef513c1dde4c1e8ef4e047dfd4ffee7f3f76df62245eb',
      pkg: 'ea70b034626c5566330b118c6bba44a69d74e4e3e9215eaa79b14fe476a7044e',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 1.0 Pack 03',
    code: 'rbnPack3',
    folderName: 'O72268RB2RBNPACK03OF07',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: 'f9c6a26585013f5b14f64c5e439308d034f7588b17b2c021078b9846c756bbcb',
      pkg: 'ad809c2d057e678f143fdc33d7c87b48d95eafebb7c3881aafb5f8a969e20b2a',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 1.0 Pack 04',
    code: 'rbnPack4',
    folderName: 'O53521RB2RBNPACK04OF07',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '4f99abd705699d358e092aac85528276da4335b7cd2457ec72a5798e5fbf8d7c',
      pkg: '163e7f4c5cf4a29e5616d606e8e79ea4ca7733f259408dce09e25205fd6ba3e8',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 1.0 Pack 05',
    code: 'rbnPack5',
    folderName: 'O822331RB2RBNPACK05OF07',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '61c2d007a97386f94067634af4dc3c89f42dc097a724f21caedca95beb29f8d6',
      pkg: 'f98f69ff41fbbe1c5a3ee664af56a00a90e6368a97c0e062698d25ed23465fb0',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 1.0 Pack 06',
    code: 'rbnPack6',
    folderName: 'O75476RB2RBNPACK06OF07',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '1661e3195c0661eca3dd5fb6506688c376f936a6dc096f80a067ce0036a75ae0',
      pkg: '633d6140f8704717823a481cc1231998ceb69a4b77dea9fff141d5c5de44c29e',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 1.0 Pack 07',
    code: 'rbnPack7',
    folderName: 'O280249RB2RBNPACK07OF07',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '0355550732445e7d7465280b88dfb40fc54ed9d1d25f86d0cabc0ec38efb1b36',
      pkg: '44e9f15cee6e5bc1b7bd505264e9ce9561f8d1cd75c202bee56bd39102097958',
      stfs: '',
    },
  },

  // #region RBN 2.0
  {
    name: 'Rock Band Network 2.0 Pack 01',
    code: 'rbn2Pack1',
    folderName: 'RB3RBNPACK01OF09',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '10bcedefb76a20221c0b522b56324dfaeb62abd782834a2e9a1b898bdaa3ea47',
      pkg: '3b627a7157c6854f04ad85a6c7adc0289395b912144ac7ccf5e3bfec4749e9cf',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 2.0 Pack 02',
    code: 'rbn2Pack2',
    folderName: 'RB3RBNPACK02OF09',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '3f4c1f1fe5ca7245344599995e6a099fd9db1ee94821a5cc85ebe371ff71f9e0',
      pkg: '90210c01dc451e99425456961312601e303a70cc2abc1714670ee08be4c73720',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 2.0 Pack 03',
    code: 'rbn2Pack3',
    folderName: 'RB3RBNPACK03OF09',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: 'd4696ad68c016390917f6ec59ce8d713ec855a2541293f2b0e8d0802b6941ab4',
      pkg: 'c4f77b6f79da4775458699a71def37a2727859640e09b9faf7c63080004a8dee',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 2.0 Pack 04',
    code: 'rbn2Pack4',
    folderName: 'RB3RBNPACK04OF09',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '09eea418d18e1b4e2f34cd2919208be38c4d6236729a8f16cee9f40ba91fa134',
      pkg: 'c38624edc5462e1b6c8b555462c54dd35ea7866b5f8d8d4720383070c740b393',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 2.0 Pack 05',
    code: 'rbn2Pack5',
    folderName: 'RB3RBNPACK05OF09',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '8fbbfb5d18705c5cf0ac141739c415d2b4e17dfdeefd17e07cbf46ffab6410af',
      pkg: 'e88267596e92175efa764ff884bb43b3ffdcfb65242db1e66d0d3f65ea43d50a',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 2.0 Pack 06',
    code: 'rbn2Pack6',
    folderName: 'RB3RBNPACK06OF09',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '793482eef067423aa04345b8d893f2d1247b20158de044759c4fc6cce2c81988',
      pkg: '3cbc9e3e255012c94396d75c6e54fc3c20a883ff227e48746a2885a0e3e24e4e',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 2.0 Pack 07',
    code: 'rbn2Pack7',
    folderName: 'RB3RBNPACK07OF09',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '89259b288840560c75326d3ef76afeb6b19b535674f5e0dd46db7063ab910367',
      pkg: '89f4becec2c67db2e17eca6c93b6091028b6d72281608e25868cc6428ebd258f',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 2.0 Pack 08',
    code: 'rbn2Pack8',
    folderName: 'RB3RBNPACK08OF09',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: 'a458c3bbbdcca9d840787bb4561015368dcf2c94f352f7edc1be178ffb224d6b',
      pkg: 'd69fd319c71b3c226191741df858d4de050cfc538700716ec0d45f3bb464951a',
      stfs: '',
    },
  },
  {
    name: 'Rock Band Network 2.0 Pack 09',
    code: 'rbn2Pack9',
    folderName: 'RB3RBNPACK09OF09',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: '3ec645d6baf87c9e234c2456732e7f1489725c0f58d9f91babd3e2b769558b93',
      pkg: 'e474ef401569ca940295691ddb6f892c2cbd8c6c64682d59283a86fd8550b113',
      stfs: '',
    },
  },

  // #region Lost RBN

  {
    name: 'Lost Rock Band Network 1.0',
    code: 'lostRBN1',
    folderName: 'LostRBN1',
    packageType: 'rb1',
    hashes: {
      extractedRPCS3: '133749bab82a88ca3e0a4ae1ae7418ca99e544d329c952b249046c7edf7faaa2',
      pkg: '56d285faa2e1d4d450dac92311e2c7d884910813da5587f398f79a636b39f6d9',
      stfs: '',
    },
  },
  {
    name: 'Lost Rock Band Network 2.0',
    code: 'lostRBN2',
    folderName: 'O839301LOSTRBNPACK01',
    packageType: 'rb3',
    hashes: {
      extractedRPCS3: 'f89b61663aebf2f346dcbda2ec46e16e95fde44ec20139aa66deeaba35fb9312',
      pkg: '87c2b20161d07d254bd856c60631324c0d44ccc177e77042990799b9a6fbe959',
      stfs: '',
    },
  },
]

/**
 * Returns an object with known properties of a specific official song package based on the song package contents hash. Returns `undefined` if the provided hash does not match any known official song package hashes.
 * - - - -
 * @param {OfficialPackagesHashTypes} type The type of the contents hash you want to search to.
 * @param {string} hash The actual hash string you want to search to.
 * @returns {OfficialSongPackageStats | undefined}
 */
export const getOfficialSongPackageStatsFromHash = (type: OfficialPackagesHashTypes, hash: string): OfficialSongPackageStats | undefined => {
  for (const pack of officialPackages) {
    if (pack.hashes[type].toLowerCase() === hash.toLowerCase()) return pack
  }
}

/**
 * Returns an object with known properties of a specific official song package based on its installed folder name. Returns `undefined` if the provided folder name does not match any known official song package folder names.
 * - - - -
 * @param {string} folderName The folder name you want to search to.
 * @returns {OfficialSongPackageStats | undefined}
 */
export const getOfficialSongPackageStatsFromPKGFolderName = (folderName: string): OfficialSongPackageStats | undefined => {
  for (const pack of officialPackages) {
    if (pack.folderName === folderName) return pack
  }
  return
}

/**
 * Checks if the provided folder name is available to be used on the Rock Band 3's USRDIR folder without merging/overwriting an existing package.
 * - - - -
 * @param {DirPathLikeTypes} devhdd0Path The path to the `dev_hdd0` folder of your RPCS3 installation.
 * @param {string} folderName The folder name you want to check availability.
 * @returns {Promise<boolean>}
 */
export const isRB3FolderNameFreeOnRPCS3 = async (devhdd0Path: DirPathLikeTypes, folderName: string): Promise<boolean> => {
  let proof = true
  const devhdd0 = isRPCS3Devhdd0PathValid(devhdd0Path)
  const allOfficialFolderNames = officialPackages.filter((pack) => pack.packageType === 'rb3').map((pack) => pack.folderName.toLowerCase())
  const allUnofficialFolderNames = (await devhdd0.gotoDir('game/BLUS30463/USRDIR').readDir()).filter((dir) => dir instanceof DirPath && dir.name !== 'gen' && dir.name !== 'custom_textures' && !allOfficialFolderNames.includes(dir.name)).map((pack) => pack.name.toLowerCase())
  const allFolderNames: string[] = [...allOfficialFolderNames, ...allUnofficialFolderNames]

  if (allFolderNames.includes(folderName.toLowerCase())) proof = false
  return proof
}
