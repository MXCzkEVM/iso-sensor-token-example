import {expect} from 'chai';
import {ContractFactory, Signer} from 'ethers';
import * as fs from 'fs';
import {ethers, upgrades} from 'hardhat';

import {MEP804v1} from '../typechain-types';

import {BlankMep3355, BlankMep3355Data, Mep3355DataPrepare, Mep3355DataExtract, Mep3355Parse} from '../typia/output/mep3355';

describe('MEP804', function() {
  let deployer: Signer;
  let otherAccount: Signer;
  let mep804v1Factory: ContractFactory;
  let mep804v1FactoryOtherAccount: ContractFactory;

  let proxyAddress: string = '';

  const initialAmount = ethers.parseEther('1000');

  beforeEach(async function() {
    [deployer, otherAccount] = await ethers.getSigners();
    mep804v1Factory = await ethers.getContractFactory('MEP804v1');
    mep804v1FactoryOtherAccount = await ethers.getContractFactory('MEP804v1', otherAccount);
  });

  describe('General Functions', async function() {
    it('Deploy V1.0', async function() {
      let token_name = 'TestCoin';
      let token_symbol = 'XTC';

      // Deploy v1
      const proxy = await upgrades.deployProxy(mep804v1Factory, [token_name, token_symbol, initialAmount]);
      await proxy.waitForDeployment();
      proxyAddress = await proxy.getAddress();

      // token name and contract name
      const name1: String = await proxy.name();
      expect(name1).to.equal(token_name);
      const name2: String = await proxy.name2();
      expect(name2).to.equal('MEP804v1');
    });

    it('Upgrade', async function() {
      // Upgrade contract
      const new_contract =
          await upgrades.upgradeProxy(proxyAddress, mep804v1Factory, {redeployImplementation: 'always'}) as unknown as MEP804v1;
      await new_contract.waitForDeployment();


      // Try read the name
      const name: String = await new_contract.name2();
      expect(name).to.equal('MEP804v1');

      // Unauthorize upgrade
      await expect(upgrades.upgradeProxy(proxyAddress, mep804v1FactoryOtherAccount, {
        redeployImplementation: 'always'
      })).to.be.reverted;
    });

    it('Mint more', async function() {
      const more = ethers.parseEther('123');

      const proxy = mep804v1Factory.attach(proxyAddress) as MEP804v1;

      expect(await proxy.totalSupply()).to.equal(initialAmount);

      await proxy.mintMore(more);

      expect(await proxy.totalSupply()).to.equal(initialAmount + more);
    });

    it('Feed and Claim', async function() {
      const proxy = mep804v1Factory.attach(proxyAddress) as MEP804v1;

      // Feed
      const provision_id = "TESTPIDOOOOOOOOOOOOOOOOI";
      const pid_evm_hash = ethers.keccak256(ethers.toUtf8Bytes((provision_id + ".ISO"))).toString();    
      const j_sensor_data = JSON.parse(fs.readFileSync('./test/sensor_data.json', 'utf8'));
      const sensor_data = JSON.stringify(j_sensor_data)

      const mep3355 = BlankMep3355();
      mep3355.metadata.data_source = "Sample test data";
      mep3355.metadata.data_collection_method = "hard coded";     
      mep3355.data.push(Mep3355DataPrepare("sensor", sensor_data));

      const reward_amount = ethers.parseEther('0.234');
      const reward_to =  await otherAccount.getAddress()

      const feed_txn =await proxy.feedData(pid_evm_hash,reward_to , reward_amount, JSON.stringify(mep3355));
      await feed_txn.wait();
      const event_list = await proxy.queryFilter(proxy.filters.DataReceived, -1)

      expect(event_list.length).to.equal(1);
      const event = event_list[0];
      expect(event.fragment.name).to.equal("DataReceived");

      expect(event.args.length).to.equal(1);
      const event_memo = event.args[0];

      const parsed = Mep3355Parse(event_memo);
      expect(parsed).is.not.undefined;
      expect(parsed?.format).to.equal("MEP-3355");
      expect(parsed?.version).to.equal("1.0.0");
      expect(parsed?.data.length).to.equal(1);
      const parsed_data = parsed?.data[0] || BlankMep3355Data();
      expect(parsed_data.type).to.equal("sensor");
      const extracted_sensor_data = Mep3355DataExtract(parsed_data);
      expect(extracted_sensor_data).to.equal(sensor_data);      

      // Claim
      const proxy2 = mep804v1FactoryOtherAccount.attach(proxyAddress) as MEP804v1;

      expect(await proxy2.amountForClaim()).to.equal(reward_amount);
      expect(await proxy2.balanceOf(await otherAccount.getAddress())).to.equal(0n);
      await proxy2.claimReward();
      expect(await proxy2.amountForClaim()).to.equal(0n);
      expect(await proxy2.balanceOf(await otherAccount.getAddress())).to.equal(reward_amount);



    });
  });
});
