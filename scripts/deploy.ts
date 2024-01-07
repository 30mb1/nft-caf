import { ethers } from "hardhat";
import {NFT, NFT__factory} from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners()

  const owner = "0x5b6df61f4d26379cB2c1bb25D436f70BDb0A99bC";
  const beneficiary = "0x6Fb01e620BED0b6bEa9A8da432BBA7ef52D7FB57";
  const uri = "";

  const nft: NFT = await new NFT__factory(deployer as any).deploy(owner, beneficiary, uri);
  await nft.waitForDeployment();

  console.log('Nft deployed', (await nft.getAddress()));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
