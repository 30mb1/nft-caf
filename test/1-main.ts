import {NFT, NFT__factory} from "../typechain-types";
import {expect} from "chai";
import {ethers} from "hardhat";


describe("Main test", function () {
  let nft: NFT;

  it('Deploy', async function() {
    const [owner, beneficiary] = await ethers.getSigners()
    nft = await new NFT__factory(owner as any).deploy(owner.address, beneficiary.address, "SOME URI");
    await nft.waitForDeployment();
    // nft = await ethers.deployContract('NFT', [owner.address, beneficiary.address]);

    const _owner = await nft.owner();
    expect(_owner).to.be.eq(owner.address);

    const _beneficiary = await nft.beneficiary();
    expect(_beneficiary).to.be.eq(beneficiary);
  });

  it('Try buy not started round', async function() {
    const [owner, beneficiary, buyer] = await ethers.getSigners();
    await expect(nft.connect(buyer).buyNFT("0", "1")).to.be.revertedWith(
      "Round not started"
    );
  });

  it("Start round", async function() {
    const [owner, beneficiary, buyer] = await ethers.getSigners();

    await expect(nft.connect(buyer).startRound("0")).to.be.revertedWithCustomError(
      nft, "OwnableUnauthorizedAccount"
    );

    await nft.connect(owner).startRound("0");
  });

  it("User buy nfts", async function() {
    const [owner, beneficiary, buyer] = await ethers.getSigners();

    // bad value

    await expect(nft.connect(buyer).buyNFT("0", "1")).to.be.revertedWith(
      "Bad value sent"
    );

    const tx = await nft.connect(buyer).buyNFT("0", "10", {value: ethers.parseEther("33")});
    const tx2 = await nft.connect(buyer).buyNFT("0", "10", {value: ethers.parseEther("33")});

    await expect(tx).to.emit(nft, "Transfer");

    const user_bal = await nft.balanceOf(buyer.address);
    expect(user_bal.toString()).to.be.eq("20");

    await expect(tx).to.changeEtherBalance(beneficiary.address, ethers.parseEther("33"));
    await expect(tx2).to.changeEtherBalance(beneficiary.address, ethers.parseEther("33"));

    const round = await nft.rounds(0);
    expect(round.limit.toString()).to.be.eq("4980");
    expect(round.offset.toString()).to.be.eq("20");

    const user_rounds = await nft.roundNfts(buyer.address, 0);
    expect(user_rounds.toString()).to.be.eq("20");
  });

  it("User try buy more than allowed", async function() {
    const [owner, beneficiary, buyer] = await ethers.getSigners();
    await expect(nft.connect(buyer).buyNFT("0", "100", {value: ethers.parseEther("330")})).to.be.revertedWith(
      "User round limit reached"
    );
  });

  it("Start next round", async function() {
    const [owner, beneficiary, buyer] = await ethers.getSigners();
    await expect(nft.connect(buyer).startRound("1")).to.be.revertedWithCustomError(
      nft, "OwnableUnauthorizedAccount"
    );
    await nft.connect(owner).startRound("1");
  });

  it("User buy nfts", async function() {
    const [owner, beneficiary, buyer] = await ethers.getSigners();
    const tx = await nft.connect(buyer).buyNFT("1", "10", {value: ethers.parseEther("44")});
    const tx2 = await nft.connect(buyer).buyNFT("1", "10", {value: ethers.parseEther("44")});

    await expect(tx).to.emit(nft, "Transfer");

    const user_bal = await nft.balanceOf(buyer.address);
    expect(user_bal.toString()).to.be.eq("40");

    await expect(tx).to.changeEtherBalance(beneficiary.address, ethers.parseEther("44"));
    await expect(tx2).to.changeEtherBalance(beneficiary.address, ethers.parseEther("44"));

    const round = await nft.rounds(1);
    expect(round.limit.toString()).to.be.eq("2980");
    expect(round.offset.toString()).to.be.eq("5020");

    const user_rounds = await nft.roundNfts(buyer.address, 1);
    expect(user_rounds.toString()).to.be.eq("20");

    const new_round_nft_id = await nft.tokenOfOwnerByIndex(buyer.address, 20);
    expect(new_round_nft_id.toString()).to.be.eq("5000");
  });

  it('Start last round', async function() {
    const [owner, beneficiary, buyer] = await ethers.getSigners();
    await expect(nft.connect(buyer).startRound("4")).to.be.revertedWithCustomError(
      nft, "OwnableUnauthorizedAccount"
    );
    await nft.connect(owner).startRound("4");
  });

  it('Check round limit', async function() {
    const [owner, beneficiary, buyer] = await ethers.getSigners();
    const tx = nft.connect(buyer).buyNFT("4", "500", {value: ethers.parseEther("1000")});
    await expect(tx).to.be.revertedWith("Round limit reached");
  });
});
