// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv/config");
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
//0x67cd6b2db8BD991d1484432729174A1a1B577a67
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "http://sepoliaExp";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "exp1Api1Key";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${SEPOLIA_RPC_URL}`,
      accounts: [PRIVATE_KEY], //0x67cd6b2db8BD991d1484432729174A1a1B577a67
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: false,
    // currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY
  },
};

export default config;
