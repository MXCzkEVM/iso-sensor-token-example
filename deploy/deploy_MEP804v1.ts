import { upgrades, ethers } from "hardhat";
import {
  MEP804v1,
} from "../typechain-types";

// The entry
async function main() {
  let [owner] = await ethers.getSigners();
  console.log(`Deploying contract by ${owner.address}.`);

  // Deploy
  const token_name = "Temperature Coin 2";
  const token_symbol = "TC2";

  const initial_amount = ethers.parseEther("100000");

  const MEP804v1Factory = await ethers.getContractFactory("MEP804v1");
  const MEP804 = await upgrades.deployProxy(MEP804v1Factory, [token_name, token_symbol, initial_amount], { timeout: (5 * 60 * 1000) });
  await MEP804.waitForDeployment();
  console.log(`MEP804v1 deployed. ${await MEP804.getAddress()}`);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});