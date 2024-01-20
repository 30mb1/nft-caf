import { ethers } from "hardhat";
import {CAFF, CAFF__factory} from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log(await ethers.provider.getBalance(deployer.address));

  const owner = "0x5b6df61f4d26379cB2c1bb25D436f70BDb0A99bC";
  const beneficiary = "0x6Fb01e620BED0b6bEa9A8da432BBA7ef52D7FB57";
  const uri = "https://gateway.pinata.cloud/ipfs/QmT3s7A3nTuGsXxiCK75erEG2mkAqWYz7aoerKB2RQw1V7/";

  const nft: CAFF = await new CAFF__factory(deployer as any).deploy(owner, beneficiary, uri);
  const q = await nft.waitForDeployment();

  console.log('Tx', await q.deploymentTransaction()?.wait())

  console.log('Nft deployed', (await nft.getAddress()));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
