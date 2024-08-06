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
  console.log('Contract: ', await proxy.name2());
  console.log('Token name: ', await proxy.name());

  //
  const provision_id = 'TESTPIDOOOOOOOOOOOOOOOOI';
  const pid_evm_hash = ethers.keccak256(ethers.toUtf8Bytes((provision_id + '.ISO'))).toString();
  const j_sensor_data = JSON.parse(fs.readFileSync('./test/sensor_data.json', 'utf8'));
  const sensor_data = JSON.stringify(j_sensor_data)

  const mep3355 = BlankMep3355();
  mep3355.metadata.data_source = 'Sample test data';
  mep3355.metadata.data_collection_method = 'hard coded';
  mep3355.data.push(Mep3355DataPrepare('sensor', sensor_data));

  const reward_amount = ethers.parseEther('0.1');
  const reward_to = await signer.getAddress()

  const feed_txn = await proxy.feedData(pid_evm_hash, reward_to, reward_amount, JSON.stringify(mep3355));
  await feed_txn.wait();

  console.log('Data feed success.');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});