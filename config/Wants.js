const OPTIMIZER_CONTROLLER = "0x2F0b4e7aC032d0708C082994Fb21Dd75DB514744";

const OPTIMIZER_POOLS = [
  //avax
  {
    snowglobe: "0x3a3a0570f66cD5DfacB3c72b5214fec88e5722a8",
    LP: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    contracts: [
      //benqi
      {
        strategy: "0xdc2159A913A99d22b771Bd614C77C45738461188",
        fixedSnowglobe: "0xaCF2814cF22fCB08b3dDA331221A52ad7B05639B" //snowglobe from non-optimized strategy
      },
      //aave
      {
        strategy: "0x0f776b5b97BfA366f929FE82bd50C312C39f26f1",
        fixedSnowglobe: "0x951f6c751A9bC5A75a4E4d43be205aADa709D3B8" //snowglobe from non-optimized strategy
      }
    ]
  },
  {
    snowglobe: "0x8665e1FAD19D14b16Eecb96A7608cD42962E7eEB",
    LP: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    contracts: [
      //benqi
      {
        strategy: "0x5618041c863228DC6298bc5fD17EADa6Fe9Df618",
        fixedSnowglobe: "0x7b2525A502800E496D2e656e5b1188723e547012" //snowglobe from non-optimized strategy
      },
      //aave
      {
        strategy: "0x13d753C651526Bf3501818813B829B339ae867AF",
        fixedSnowglobe: "0xE4543C234D4b0aD6d29317cFE5fEeCAF398f5649" //snowglobe from non-optimized strategy
      }
    ]
  }
]

const Wants = {
  GAUGE_PROXY_ADDRESS: "0x215D5eDEb6A6a3f84AE9d72962FEaCCdF815BF27",

  OVERRIDE_OMIT: [
    '0xA42BE3dB9aff3aee48167b240bFEE5e1697e1281', // S3F
    '0xdE1A11C331a0E45B9BA8FeE04D4B51A745f1e4A4', // S3D
    '0x53B37b9A6631C462d74D65d61e1c056ea9dAa637',
    '0xbBA0f8A3Aa16657D1df2A6E87A73ee74Fec42711', // Deprecated
    '0x7b74324f523831687fC8FCE946F15a3AA632dC06', // broken benqi wavax
    '0x68b8037876385BBd6bBe80bAbB2511b95DA372C4', // broken benqi qi
    '0x59C7b6E757CA14EF6F47e06A30B74CaE1017D92C'  // broken teddyxteddy
  ],

  OVERRIDE_ADD: [
    // '0x0000000000000000000000000000000000000000', // 'Add-Pool'
  ],

  CONTROLLERS: [
    OPTIMIZER_CONTROLLER,
    '0x14559fb4d15Cf8DCbc35b7EDd1215d56c0468202', // Platypus controller
    '0xCEB829a0881350689dAe8CBD77D0E012cf7a6a3f', // New trader joe controller
    '0x252B5fD3B1Cb07A2109bF36D5bDE6a247c6f4B59', // BENQI second Controller
    '0xF2FA11Fc9247C23b3B622C41992d8555f6D01D8f', // new BANKER JOE controller
    '0xACc69DEeF119AB5bBf14e6Aaf0536eAFB3D6e046', // second deployment (must come first to supersede other controller
    '0x425A863762BBf24A986d8EaE2A367cb514591C6F', // AAVE Controller
    '0x8Ffa3c1547479B77D9524316D5192777bedA40a1', // BENQI Controller
    '0xf7B8D9f8a82a7a6dd448398aFC5c77744Bd6cb85', // first deployment
    '0xc7D536a04ECC43269B6B95aC1ce0a06E0000D095', // AXIAL Controller
    '0xFb7102506B4815a24e3cE3eAA6B834BE7a5f2807', // Banker Joe Controller
  ],

};

module.exports = { WANTS: Wants, OPTIMIZER_CONTROLLER, OPTIMIZER_POOLS};
