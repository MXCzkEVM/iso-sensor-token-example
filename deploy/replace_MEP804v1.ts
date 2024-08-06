import { upgrades, ethers } from "hardhat";
import {
  MEP804v1,
} from "../typechain-types";

//
const ProxyAddressMEP804: string | undefined = process.env.PROXY_MEP804;

// The entry
async function main() {
  // Check env setting
  if (!ProxyAddressMEP804) {
    console.log("Please set the PROXY_MEP804 to the deployed proxy address.");
    process.exit(1);
  }

  //
  let [owner] = await ethers.getSigners();
  console.log(`Replacing contract to Proxy ${ProxyAddressMEP804} by ${owner.address}.`);

  // Deploy
  const MEP804v1Factory = await ethers.getContractFactory("MEP804v1");
  const MEP804 = await upgrades.upgradeProxy(ProxyAddressMEP804, MEP804v1Factory, { redeployImplementation: "always", timeout: (5 * 60 * 1000) });
  await MEP804.waitForDeployment();
  console.log(`MEP804 upgraded. ${await MEP804.getAddress()}`);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});