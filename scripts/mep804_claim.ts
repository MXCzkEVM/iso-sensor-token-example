import {Contract} from 'ethers';
import * as fs from 'fs';
import {ethers} from 'hardhat';

import {MEP804v1} from '../typechain-types';
import {BlankMep3355, Mep3355DataPrepare} from '../typia/output/mep3355';

const ProxyAddressMep804: string|undefined = process.env.PROXY_MEP804;

// The entry
async function main() {
  // Check env setting
  if (!ProxyAddressMep804) {
    console.log('Please set the PROXY_MEP804 to the deployed proxy address.');
    process.exit(1);
  }

  //
  console.log('ethers: ', ethers.version);

  //
  const [signer] = await ethers.getSigners();
  console.log('signer: ', signer.address);

  // Contract
  const mep804v1Factory = await ethers.getContractFactory('MEP804v1');
  const proxy = mep804v1Factory.attach(ProxyAddressMep804) as MEP804v1;
  let token_symbol = await proxy.symbol();
  console.log(`Contract: ${await proxy.name2()}`);
  console.log(`Token name: ${await proxy.name()}`);
  console.log(`Amount available: ${ethers.formatEther(await proxy.amountForClaim())} ${token_symbol}`);

  //
  console.log('Claim...');
  const claim_txn = await proxy.claimReward();
  await claim_txn.wait();

  const my_token = await proxy.balanceOf(signer.address);
  console.log(`Balance: ${ethers.formatEther(my_token)} ${token_symbol}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});