import {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} from "../../helper-hardhat-config";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../../helper-hardhat-config");
// const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

export default buildModule("MocksModule", (m) => {
  const MockV3Aggregator = m.contract("MockV3Aggregator", [
    DECIMALS,
    INITIAL_ANSWER,
  ]);
  console.log("deployed mocks");
  return { MockV3Aggregator };
});
