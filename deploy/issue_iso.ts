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

//==========================================================================
//==========================================================================
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

//==========================================================================
//==========================================================================
function BigIntToHex(aValue: bigint|number|string): string {
  const v = BigInt(aValue);
  let ret_hex = v.toString(16);
  if (!ret_hex.startsWith('0x')) {
    ret_hex = '0x' + ret_hex;
  }
  return ret_hex;
}

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
    console.log('Please set the PROXY_MEP804 to the deployed proxy address.');
    process.exit(1);
  }

  //
  console.log('ethers: ', ethers.version);

  //
  const [signer] = await ethers.getSigners();
  console.log('signer: ', signer.address);

  // Show contracts name
  const proxy_mep801 = new Contract(ProxyAddressMep801, interface_mep801.abi, signer);
  console.log(`MEP801 name: '${await proxy_mep801.name()}'`);

  const mep804v1Factory = await ethers.getContractFactory('MEP804v1');
  const proxy_mep804 = mep804v1Factory.attach(ProxyAddressMep804) as MEP804v1;
  console.log(`MEP804 name: '${await proxy_mep804.name2()}'`);
  const token_name = await proxy_mep804.name();
  const token_symbol = await proxy_mep804.symbol();
  console.log(`  Token: ${token_name} (${token_symbol})`);

  // Create Applicaiton
  const create_tnx = await proxy_mep801.getFunction('createApplication').send(token_name);
  await create_tnx.wait();
  const event_list = await proxy_mep801.queryFilter("ApplicationCreated", -1);
  var parsedEvents = event_list.map(function(log) {return proxy_mep801.interface.parseLog(log)});
  if (!parsedEvents) {
    console.log("Error. Failed to get event log.");
    process.exit(1);
  }
  let app_idx = 0n;
  for (let i = 0; i < parsedEvents.length; i ++) {
    const event = parsedEvents[i];
    if ((event) && (event.name == "ApplicationCreated") && (event.args.length == 3)) {
      app_idx = event.args[0];
      break;
    }
  }
  if (app_idx == 0n) {
    console.log("Error. Failed to get AppIdx.");
    process.exit(1);
  }

  // Set MEP804 to Application
  console.log(`Link MEP804 address with AppIdx ${app_idx}`)
  const set_tnx = await proxy_mep801.getFunction('setRewardContract').send(app_idx, ProxyAddressMep804);
  await set_tnx.wait();

  // All done
  console.log("ISO sensor token issued.");
  console.log(`  AppIdx: ${app_idx}`);
  console.log(`  ERC20: ${ProxyAddressMep804}`);
  console.log(`  Token: ${token_name} (${token_symbol})`);  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});