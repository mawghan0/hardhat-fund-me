// const {
//   loadFixture,
// } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { expect } = require("chai");
// const { DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");
// const { ethers } = require("hardhat");

import { ethers } from "hardhat";
import { DECIMALS, INITIAL_ANSWER } from "../helper-hardhat-config";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { FundMe } from "../typechain-types/contracts/FundMe";

describe("FundMe", function () {
  async function deployFundMeFixture() {
    const [owner, notOwner] = await ethers.getSigners();

    const hardhatMocks = await ethers.deployContract("MockV3Aggregator", [
      DECIMALS,
      INITIAL_ANSWER,
    ]);
    await hardhatMocks.waitForDeployment();
    // console.log(`mocksAddress : ${hardhatMocks.target}`)
    const hardhatFundMe: FundMe = await ethers.deployContract("FundMe", [
      hardhatMocks.target,
    ]);
    await hardhatFundMe.waitForDeployment();

    return { hardhatMocks, hardhatFundMe, owner, notOwner };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { hardhatFundMe, owner } = await loadFixture(deployFundMeFixture);
      const ownerFundMe = await hardhatFundMe.i_owner();
      // console.log(`owner : ${ownerFundMe}`)
      expect(ownerFundMe).to.equal(owner.address);
    });

    it("Should set the mock priceFeed", async function () {
      const { hardhatMocks, hardhatFundMe } = await loadFixture(
        deployFundMeFixture
      );
      const constructorPriceFeed = await hardhatFundMe.priceFeed();
      // console.log(`fundMePriceFeed : ${constructorPriceFeed}`)
      expect(await hardhatMocks.target).to.equal(constructorPriceFeed);
    });
  });

  describe("Fund", function () {
    it("allows users to fund if minimum ETH amount in USD is met", async function () {
      const enoughEth = ethers.parseEther("1");
      const { hardhatFundMe, owner } = await loadFixture(deployFundMeFixture);
      await hardhatFundMe.fund({ value: enoughEth });

      // mapping has same funded
      const valueFund = await hardhatFundMe.addressToAmountFunded(
        owner.address
      );
      expect(enoughEth).to.equal(valueFund);

      // get in array funders
      const funder = await hardhatFundMe.funders(0);
      expect(owner.address).to.equal(funder);
    });

    it("fails if not enough ETH is sent", async function () {
      const lowValue = ethers.parseEther("0.0001"); // Too low to meet minimum USD threshold
      const { hardhatFundMe, owner } = await loadFixture(deployFundMeFixture);

      // reverted
      await expect(hardhatFundMe.fund({ value: lowValue })).to.be.revertedWith(
        "You need to spend more ETH!"
      );

      // mapping should 0
      const valueFund = await hardhatFundMe.addressToAmountFunded(
        owner.address
      );
      expect(valueFund).to.equal(0);
    });
  });

  describe("Withdraw", function () {
    it("allows the owner to withdraw ETH", async function () {
      const enoughEth = ethers.parseEther("1");
      const { hardhatFundMe, owner } = await loadFixture(deployFundMeFixture);
      await hardhatFundMe.fund({ value: enoughEth });

      const startingFundMeBalance = await ethers.provider.getBalance(
        hardhatFundMe.target
      );
      const startingOwnerBalance = await ethers.provider.getBalance(
        owner.address
      );

      const transaction = await hardhatFundMe.withdraw();
      const transactionReceipt = await transaction.wait();

      // Check if transactionReceipt is not null
      if (transactionReceipt) {
        const gasUsed: bigint = transactionReceipt.gasUsed;
        const gasPrice: bigint =
          transactionReceipt.gasPrice || ethers.parseUnits("1", "gwei");
        // console.log(`gasPrice: ${gasPrice}`);
        const gasCost: bigint = gasUsed * gasPrice;

        const endingFundMeBalance = await ethers.provider.getBalance(
          hardhatFundMe.target
        );
        const endingOwnerBalance = await ethers.provider.getBalance(
          owner.address
        );
        // console.log(`endings: ${endingOwnerBalance}`);
        const balance = startingOwnerBalance + startingFundMeBalance - gasCost;
        // console.log(`balance: ${balance}`);
        expect(endingFundMeBalance).to.equal(0);
        expect(endingOwnerBalance).to.equal(
          startingOwnerBalance + startingFundMeBalance - gasCost
        );
      } else {
        throw new Error("Transaction receipt is null");
      }
    });

    it("resets funders' balances to 0 after withdrawal", async function () {
      const enoughEth = ethers.parseEther("1");
      const { hardhatFundMe, owner } = await loadFixture(deployFundMeFixture);
      await hardhatFundMe.fund({ value: enoughEth });

      await hardhatFundMe.withdraw();
      // mapping should 0
      expect(await hardhatFundMe.addressToAmountFunded(owner.address)).to.equal(
        0
      );

      // array should revert
      await expect(hardhatFundMe.funders(0)).to.be.reverted;
    });

    it("resets funders' balances to 0 after withdrawal", async function () {
      const enoughEth = ethers.parseEther("1");
      const { hardhatFundMe, notOwner } = await loadFixture(
        deployFundMeFixture
      );
      await hardhatFundMe.fund({ value: enoughEth });

      await expect(
        hardhatFundMe.connect(notOwner).withdraw()
      ).to.be.revertedWithCustomError(hardhatFundMe, "FundMe__NotOwner");
    });
  });
});
