import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';

const blankAddress = "0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: {
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['storageLayout'],
        },
      },
    },
    version: "0.8.24",
  },
  networks: {
    mxc_mainnet: {
      url: 'https://rpc.moonchain.com',
      chainId: 18686,
      accounts: [process.env.DEPLOYER_KEY || blankAddress],
    },
    mxc_testnet: {
      url:
          process.env.MXC_TESTNET_URL || 'http://geneva-rpc.moonchain.com:8545',
      chainId: 5167004,
      accounts: [process.env.DEPLOYER_KEY || blankAddress],
    },
  },
  sourcify: {
    enabled: false
  },  
  etherscan: {
    apiKey: {
      geneva: "X"
    },
    customChains: [
      {
        network: "geneva",
        chainId: 5167004,
        urls: {
          apiURL: "https://geneva-explorer-v1.moonchain.com/api",
          browserURL: "https://geneva-explorer-v1.moonchain.com"
        }
      }
    ]
  }
};

export default config;
