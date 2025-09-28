const { expect } = require("chai");
const hre = require("hardhat");

describe("MemoryLayer", function () {
  let memoryLayer;
  let owner, agent1, agent2, lowBalanceUser, highBalanceUser;

  beforeEach(async function () {
    // Get signers
    [owner, agent1, agent2, lowBalanceUser, highBalanceUser] = await hre.ethers.getSigners();

    // Deploy the contract
    const MemoryLayerFactory = await hre.ethers.getContractFactory("MemoryLayer");
    memoryLayer = await MemoryLayerFactory.deploy();

    // Fund highBalanceUser with > 1.5 ETH for testing
    await owner.sendTransaction({
      to: await highBalanceUser.getAddress(),
      value: hre.ethers.parseEther("2.0")
    });
  });

  describe("Writing Memories", function () {
    it("Should allow agents to write memories", async function () {
      const memoryHash = "QmXYZ123...";
      
      await expect(memoryLayer.connect(agent1).writeMemory(memoryHash))
        .to.emit(memoryLayer, "MemoryWritten")
        .withArgs(await agent1.getAddress(), memoryHash, await hre.ethers.provider.getBlock("latest").then((b) => b.timestamp + 1));

      expect(await memoryLayer.getMemoryCount(await agent1.getAddress())).to.equal(1);
    });

    it("Should reject empty memory hash", async function () {
      await expect(memoryLayer.connect(agent1).writeMemory(""))
        .to.be.revertedWithCustomError(memoryLayer, "EmptyMemoryHash");
    });

    it("Should store multiple memories for the same agent", async function () {
      await memoryLayer.connect(agent1).writeMemory("hash1");
      await memoryLayer.connect(agent1).writeMemory("hash2");
      
      expect(await memoryLayer.getMemoryCount(await agent1.getAddress())).to.equal(2);
      expect(await memoryLayer.getMemoryAtIndex(await agent1.getAddress(), 0)).to.equal("hash1");
      expect(await memoryLayer.getMemoryAtIndex(await agent1.getAddress(), 1)).to.equal("hash2");
    });
  });

  describe("Reading Memories", function () {
    beforeEach(async function () {
      await memoryLayer.connect(agent1).writeMemory("bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy");
    });

    it("Should allow users with sufficient ETH balance to read", async function () {
      const sufficientUser = await hre.ethers.getImpersonatedSigner("0x742d35Cc5F2324e96E201d99A98E246664e5C7bE");
      await hre.network.provider.send("hardhat_setBalance", [
        await sufficientUser.getAddress(),
        hre.ethers.toBeHex(hre.ethers.parseEther("2"))
      ]);

      const hash = await memoryLayer.connect(sufficientUser).readMemory(await agent1.getAddress());
      expect(hash).to.equal("bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy");
    });

    it("Should reject users with insufficient ETH balance", async function () {
      const lowBalanceAddress = await lowBalanceUser.getAddress();
      const balance = await hre.ethers.provider.getBalance(lowBalanceAddress);
      
      await expect(memoryLayer.connect(lowBalanceUser).readMemory(await agent1.getAddress()))
        .to.be.revertedWithCustomError(memoryLayer, "InsufficientETHBalance")
        .withArgs(lowBalanceAddress, balance, hre.ethers.parseEther("1.5"));
    });

    it("Should reject reading non-existent memories", async function () {
      await expect(memoryLayer.connect(highBalanceUser).readMemory(await agent2.getAddress()))
        .to.be.revertedWithCustomError(memoryLayer, "NoMemoriesFound");
    });

    it("Should emit MemoryRead event when memory is read", async function () {
      await expect(memoryLayer.connect(highBalanceUser).readMemory(await agent1.getAddress()))
        .to.emit(memoryLayer, "MemoryRead")
        .withArgs(await agent1.getAddress(), await highBalanceUser.getAddress(), await hre.ethers.provider.getBlock("latest").then((b) => b.timestamp + 1));
    });
  });

  describe("Payment Functionality", function () {
    it("Should allow users to pay for access", async function () {
      const testUser = lowBalanceUser;
      const balance = await hre.ethers.provider.getBalance(await testUser.getAddress());
      
      await owner.sendTransaction({
        to: await testUser.getAddress(),
        value: balance - hre.ethers.parseEther("0.001") // Leave small amount for gas
      });

      await expect(memoryLayer.connect(testUser).payForAccess({
        value: hre.ethers.parseEther("1.5")
      })).to.not.be.reverted;
    });

    it("Should reject insufficient payment", async function () {
      await expect(memoryLayer.connect(lowBalanceUser).payForAccess({
        value: hre.ethers.parseEther("1.0")
      })).to.be.revertedWithCustomError(memoryLayer, "InsufficientPayment");
    });
  });

  describe("Memory Management", function () {
    beforeEach(async function () {
      await memoryLayer.connect(agent1).writeMemory("memory1");
      await memoryLayer.connect(agent1).writeMemory("memory2");
      await memoryLayer.connect(agent1).writeMemory("memory3");
    });

    it("Should return correct memory count", async function () {
      expect(await memoryLayer.getMemoryCount(await agent1.getAddress())).to.equal(3);
    });

    it("Should return memory at specific index", async function () {
      expect(await memoryLayer.getMemoryAtIndex(await agent1.getAddress(), 1)).to.equal("memory2");
    });

    it("Should revert for out of bounds index", async function () {
      await expect(memoryLayer.getMemoryAtIndex(await agent1.getAddress(), 5))
        .to.be.revertedWith("Memory index out of bounds");
    });

    it("Should require sufficient balance for reading", async function () {
      await expect(memoryLayer.connect(lowBalanceUser).getMemoryAtIndex(await agent1.getAddress(), 0))
        .to.be.revertedWithCustomError(memoryLayer, "InsufficientETHBalance");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to withdraw", async function () {
      await memoryLayer.connect(highBalanceUser).payForAccess({
        value: hre.ethers.parseEther("2.0")
      });

      const initialBalance = await hre.ethers.provider.getBalance(await owner.getAddress());
      await memoryLayer.connect(owner).withdraw();
      const finalBalance = await hre.ethers.provider.getBalance(await owner.getAddress());

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should reject withdrawal by non-owner", async function () {
      await expect(memoryLayer.connect(agent1).withdraw())
        .to.be.revertedWithCustomError(memoryLayer, "OwnableUnauthorizedAccount")
        .withArgs(await agent1.getAddress());
    });
  });
});