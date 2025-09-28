const { expect } = require("chai");
const hre = require("hardhat");
const { ethers, network } = hre;

describe("MemoryLayer", function () {
  let memoryLayer: any;
  let owner: any;
  let agent1: any;
  let agent2: any;
  let lowBalanceUser: any;
  let highBalanceUser: any;

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

  describe("Writing Memories", function () {
    it("Should allow agents to write memories", async function () {
      const memoryHash = "QmXYZ123...";
      
      await expect(memoryLayer.connect(agent1).writeMemory(memoryHash))
        .to.emit(memoryLayer, "MemoryWritten")
        .withArgs(await agent1.getAddress(), memoryHash, await ethers.provider.getBlock("latest").then((b: any) => b!.timestamp + 1));

      expect(await memoryLayer.getMemoryCount(await agent1.getAddress())).to.equal(1);
    });

    it("Should reject empty memory hashes", async function () {
      await expect(memoryLayer.connect(agent1).writeMemory(""))
        .to.be.revertedWithCustomError(memoryLayer, "EmptyMemoryHash");
    });

    it("Should allow multiple memories per agent", async function () {
      await memoryLayer.connect(agent1).writeMemory("QmXYZ1...");
      await memoryLayer.connect(agent1).writeMemory("QmXYZ2...");
      await memoryLayer.connect(agent1).writeMemory("QmXYZ3...");

      expect(await memoryLayer.getMemoryCount(await agent1.getAddress())).to.equal(3);
    });
  });

  describe("Reading Memories", function () {
    beforeEach(async function () {
      // Setup some test memories
      await memoryLayer.connect(agent1).writeMemory("QmMemory1...");
      await memoryLayer.connect(agent1).writeMemory("QmMemory2...");
    });

    it("Should allow users with sufficient ETH balance to read", async function () {
      const sufficientUser = await ethers.getImpersonatedSigner("0x742d35Cc5F2324e96E201d99A98E246664e5C7bE");
      await network.provider.send("hardhat_setBalance", [
        await sufficientUser.getAddress(),
        ethers.toBeHex(ethers.parseEther("2"))
      ]);

      const hash = await memoryLayer.connect(sufficientUser).readMemory(await agent1.getAddress());
      expect(hash).to.equal("bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy");
    });

    it("Should reject users with insufficient ETH balance", async function () {
      const lowBalanceAddress = await lowBalanceUser.getAddress();
      const balance = await ethers.provider.getBalance(lowBalanceAddress);
      
      await expect(memoryLayer.connect(lowBalanceUser).readMemory(await agent1.getAddress()))
        .to.be.revertedWithCustomError(memoryLayer, "InsufficientETHBalance")
        .withArgs(lowBalanceAddress, balance, ethers.parseEther("1.5"));
    });

    it("Should revert when trying to read memories for agent with no memories", async function () {
      await expect(memoryLayer.connect(highBalanceUser).readMemory(await agent2.getAddress()))
        .to.be.revertedWithCustomError(memoryLayer, "NoMemoriesFound")
        .withArgs(await agent2.getAddress());
    });

    it("Should emit event when reading memories with readMemoryWithEvent", async function () {
      await expect(memoryLayer.connect(highBalanceUser).readMemoryWithEvent(await agent1.getAddress()))
        .to.emit(memoryLayer, "MemoryRead")
        .withArgs(await agent1.getAddress(), await highBalanceUser.getAddress(), await ethers.provider.getBlock("latest").then((b: any) => b!.timestamp + 1));
    });
  });

  describe("Access Control", function () {
    it("Should check ETH balance is exactly 1.5 ETH", async function () {
      // This test verifies the boundary condition
      const testUser = agent2;
      
      // First, drain the account
      const balance = await ethers.provider.getBalance(await testUser.getAddress());
      if (balance > 0) {
        await testUser.sendTransaction({
          to: await owner.getAddress(),
          value: balance - ethers.parseEther("0.001") // Leave small amount for gas
        });
      }
      
      // Send exactly 1.5 ETH
      await owner.sendTransaction({
        to: await testUser.getAddress(),
        value: ethers.parseEther("1.5")
      });

      // Should be able to read memories
      await memoryLayer.connect(agent1).writeMemory("QmTest...");
      const memories = await memoryLayer.connect(testUser).readMemory(await agent1.getAddress());
      expect(memories).to.have.lengthOf(1);
    });
  });

  describe("Memory Indexing", function () {
    beforeEach(async function () {
      await memoryLayer.connect(agent1).writeMemory("QmFirst...");
      await memoryLayer.connect(agent1).writeMemory("QmSecond...");
      await memoryLayer.connect(agent1).writeMemory("QmThird...");
    });

    it("Should retrieve memory by index", async function () {
      const memory = await memoryLayer.connect(highBalanceUser).getMemoryByIndex(await agent1.getAddress(), 1);
      expect(memory).to.equal("QmSecond...");
    });

    it("Should revert when index is out of bounds", async function () {
      await expect(memoryLayer.connect(highBalanceUser).getMemoryByIndex(await agent1.getAddress(), 10))
        .to.be.revertedWith("Memory index out of bounds");
    });

    it("Should enforce ETH balance for getMemoryByIndex", async function () {
      await expect(memoryLayer.connect(lowBalanceUser).getMemoryByIndex(await agent1.getAddress(), 0))
        .to.be.revertedWithCustomError(memoryLayer, "InsufficientETHBalance");
    });
  });

  describe("Owner Functions", function () {
    beforeEach(async function () {
      await memoryLayer.connect(agent1).writeMemory("QmToDelete...");
    });

    it("Should allow owner to clear memories", async function () {
      expect(await memoryLayer.getMemoryCount(await agent1.getAddress())).to.equal(1);
      
      await memoryLayer.connect(owner).clearMemories(await agent1.getAddress());
      
      expect(await memoryLayer.getMemoryCount(await agent1.getAddress())).to.equal(0);
    });

    it("Should not allow non-owners to clear memories", async function () {
      await expect(memoryLayer.connect(agent1).clearMemories(await agent1.getAddress()))
        .to.be.revertedWithCustomError(memoryLayer, "OwnableUnauthorizedAccount")
        .withArgs(await agent1.getAddress());
    });
  });
});