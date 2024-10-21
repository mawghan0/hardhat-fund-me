// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

// const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
// const { networkConfig, developmentChains } = require("../../helper-hardhat-config")

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { networkConfig, developmentChains } from "../../helper-hardhat-config";
import { network } from "hardhat";

module.exports = buildModule("FundMeModule", (m) => {
  const chainId = network.config.chainId || 31337;
  console.log(`chain id = ${chainId} ${network.name}`);

  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    // const ethUsdAggregator = m.useModule("MocksModule");
    // console.log(`module mock = ${ethUsdAggregator}`);
    // ethUsdPriceFeedAddress = ethUsdAggregator.address;
    ethUsdPriceFeedAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    // console.log(`module mock add = ${ethUsdAggregator.address}`);
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  console.log(`tes feed = ${ethUsdPriceFeedAddress}`);

  const fundMe = m.contract("FundMe", [ethUsdPriceFeedAddress]);

  return { fundMe };
});
