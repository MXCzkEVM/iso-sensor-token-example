import {Contract} from 'ethers';
import {ethers} from 'hardhat';

import {MEP804v1} from '../typechain-types';

import interface_mep801 = require('../iso-contracts/interfaces/IMEP801v1.json');
import interface_mep802 = require('../iso-contracts/interfaces/IMEP802v1.json');
import interface_mep803 = require('../iso-contracts/interfaces/IMEP803v1.json');

const ProxyAddressMep801: string|undefined = process.env.PROXY_MEP801;
const ProxyAddressMep802: string|undefined = process.env.PROXY_MEP802;
const ProxyAddressMep803: string|undefined = process.env.PROXY_MEP803;
const ProxyAddressMep804: string|undefined = process.env.PROXY_MEP804;

// The entry
async function main() {
  // Check env setting
  if (!ProxyAddressMep801) {
    console.log('Please set the PROXY_MEP801 to the deployed proxy address.');
    process.exit(1);
  }
  if (!ProxyAddressMep802) {
    console.log('Please set the PROXY_MEP802 to the deployed proxy address.');
    process.exit(1);
  }
  if (!ProxyAddressMep803) {
    console.log('Please set the PROXY_MEP803 to the deployed proxy address.');
    process.exit(1);
  }
  if (!ProxyAddressMep804) {
    console.log('Warning. PROXY_MEP804 not set.');
  }

  //
  console.log('ethers: ', ethers.version);

  //
  const [signer] = await ethers.getSigners();
  console.log('signer: ', signer.address);

  // Show contracts name
  const proxy_mep801 = new Contract(ProxyAddressMep801, interface_mep801.abi, signer);
  let mep801_name: String = await proxy_mep801.name();
  console.log(`MEP801 name: '${mep801_name}'`);

  const proxy_mep802 = new Contract(ProxyAddressMep802, interface_mep802.abi, signer);
  let mep802_name: String = await proxy_mep802.name2();
  console.log(`MEP802 name: '${mep802_name}'`);

  const proxy_mep803 = new Contract(ProxyAddressMep803, interface_mep803.abi, signer);
  let mep803_name: String = await proxy_mep803.name();
  console.log(`MEP803 name: '${mep803_name}'`);

  //
  if (ProxyAddressMep804) {
    const mep804v1Factory = await ethers.getContractFactory('MEP804v1');
    const proxy_mep804 = mep804v1Factory.attach(ProxyAddressMep804) as MEP804v1;
    console.log('MEP804 name: ', await proxy_mep804.name2());
    console.log('  Token name: ', await proxy_mep804.name());
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});