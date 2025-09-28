import { expect } from "chai";
const hre = require("hardhat");
const { ethers, network } = hre;

describe("MemoryLayer with Libraries", function () {
  let memoryLayer;
  let owner;
  let agent1;
  let agent2;
  let lowBalanceUser;
  let highBalanceUser;

  beforeEach(async function () {
    // Get signers
    [owner, agent1, agent2, lowBalanceUser, highBalanceUser] = await ethers.getSigners();

    // Deploy the contract
    const MemoryLayerFactory = await ethers.getContractFactory("MemoryLayer");
    memoryLayer = await MemoryLayerFactory.deploy();

    // Fund highBalanceUser with > 1.5 ETH for testing
    await owner.sendTransaction({
      to: await highBalanceUser.getAddress(),
      value: ethers.parseEther("2.0")
    });
  });

  describe("Library Integration", function () {
    it("Should use MemoryAccessControl library for validation", async function () {
      const memoryHash = "QmTestHash123";
      
      await memoryLayer.connect(agent1).writeMemory(memoryHash);
      expect(await memoryLayer.getMemoryCount(await agent1.getAddress())).to.equal(1);
    });

    it("Should use MemoryStorage library for data management", async function () {
      const memoryHash1 = "QmHash1";
      const memoryHash2 = "QmHash2";
      
      await memoryLayer.connect(agent1).writeMemory(memoryHash1);
      await memoryLayer.connect(agent1).writeMemory(memoryHash2);
      
      expect(await memoryLayer.getMemoryCount(await agent1.getAddress())).to.equal(2);
      
      // Test latest memory functionality
      const latestMemory = await memoryLayer.connect(highBalanceUser).getLatestMemory(await agent1.getAddress());
      expect(latestMemory).to.equal(memoryHash2);
    });

    it("Should use MemoryEconomics library for payments", async function () {
      const paymentAmount = ethers.parseEther("0.02"); // More than minimum
      
      await expect(memoryLayer.connect(lowBalanceUser).payForAccess({ value: paymentAmount }))
        .to.emit(memoryLayer, "PaymentReceived")
        .withArgs(await lowBalanceUser.getAddress(), paymentAmount, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should handle memory range queries", async function () {
      const hashes = ["QmHash1", "QmHash2", "QmHash3", "QmHash4"];
      
      // Add multiple memories
      for (const hash of hashes) {
        await memoryLayer.connect(agent1).writeMemory(hash);
      }
      
      // Test range query
      const rangeMemories = await memoryLayer.connect(highBalanceUser)
        .getMemoryRange(await agent1.getAddress(), 1, 3);
      
      expect(rangeMemories.length).to.equal(2);
      expect(rangeMemories[0]).to.equal(hashes[1]);
      expect(rangeMemories[1]).to.equal(hashes[2]);
    });

    it("Should validate agent addresses using library", async function () {
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      
      await expect(memoryLayer.getMemoryCount(zeroAddress))
        .to.be.revertedWithCustomError(memoryLayer, "InvalidAgent");
    });

    it("Should handle insufficient payment validation", async function () {
      const insufficientPayment = ethers.parseEther("0.005"); // Less than minimum
      
      await expect(memoryLayer.connect(lowBalanceUser).payForAccess({ value: insufficientPayment }))
        .to.be.revertedWithCustomError(memoryLayer, "InsufficientPayment");
    });

    it("Should allow owner to withdraw funds", async function () {
      // First, add some funds to the contract
      await memoryLayer.connect(lowBalanceUser).payForAccess({ value: ethers.parseEther("0.02") });
      
      const initialBalance = await ethers.provider.getBalance(await owner.getAddress());
      const contractBalance = await memoryLayer.getContractBalance();
      
      await expect(memoryLayer.connect(owner).withdraw())
        .to.emit(memoryLayer, "FundsWithdrawn")
        .withArgs(await owner.getAddress(), contractBalance, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should check if agent has memories", async function () {
      expect(await memoryLayer.hasMemories(await agent1.getAddress())).to.be.false;
      
      await memoryLayer.connect(agent1).writeMemory("QmTestHash");
      
      expect(await memoryLayer.hasMemories(await agent1.getAddress())).to.be.true;
    });

    it("Should clear memories for agent (owner only)", async function () {
      await memoryLayer.connect(agent1).writeMemory("QmTestHash");
      expect(await memoryLayer.hasMemories(await agent1.getAddress())).to.be.true;
      
      await memoryLayer.connect(owner).clearMemories(await agent1.getAddress());
      expect(await memoryLayer.hasMemories(await agent1.getAddress())).to.be.false;
    });

    it("Should validate memory index bounds", async function () {
      await memoryLayer.connect(agent1).writeMemory("QmTestHash");
      
      // Valid index should work
      await memoryLayer.connect(highBalanceUser).getMemoryByIndex(await agent1.getAddress(), 0);
      
      // Invalid index should fail
      await expect(memoryLayer.connect(highBalanceUser).getMemoryByIndex(await agent1.getAddress(), 1))
        .to.be.revertedWithCustomError(memoryLayer, "MemoryIndexOutOfBounds");
    });
  });

  describe("Enhanced Functionality", function () {
    it("Should handle empty memory hash validation", async function () {
      await expect(memoryLayer.connect(agent1).writeMemory(""))
        .to.be.revertedWithCustomError(memoryLayer, "EmptyMemoryHash");
    });

    it("Should validate ETH balance for reading", async function () {
      await memoryLayer.connect(agent1).writeMemory("QmTestHash");
      
      await expect(memoryLayer.connect(lowBalanceUser).readMemory(await agent1.getAddress()))
        .to.be.revertedWithCustomError(memoryLayer, "InsufficientETHBalance");
    });

    it("Should work with high balance users", async function () {
      await memoryLayer.connect(agent1).writeMemory("QmTestHash");
      
      const memories = await memoryLayer.connect(highBalanceUser).readMemory(await agent1.getAddress());
      expect(memories.length).to.equal(1);
      expect(memories[0]).to.equal("QmTestHash");
    });
  });
});