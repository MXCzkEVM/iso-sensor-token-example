//==========================================================================
// ISO Rewarding Service
//==========================================================================
import axios, {AxiosResponse} from 'axios';

import {Contract} from 'ethers';
import {ethers} from 'hardhat';

import interface_mep801 = require('../iso-contracts/interfaces/IMEP801v1.json');
import interface_mep802 = require('../iso-contracts/interfaces/IMEP802v1.json');
import {MEP804v1,} from '../typechain-types';

import {AppLogger} from './app_logger';

import {BlankMep3355, Mep3355DataPrepare} from '../typia/output/mep3355';

//==========================================================================
// Global variables
//==========================================================================
const gLoggerTag = 'REWARD';
const gProxyAddressMep801: string|undefined = process.env.PROXY_MEP801;
const gProxyAddressMep802: string|undefined = process.env.PROXY_MEP802;
const gProxyAddressMep804: string|undefined = process.env.PROXY_MEP804;

type DbEnvironments = 'development'|'production';
const gNodeMode: DbEnvironments = (process.env.NODE_ENV == 'production') ? 'production' : 'development';

const gChirpvmApiUrl = process.env.CHIRPVM_API_URL || 'https://chirpvm.matchx.io/iso-api';
const gTargetApplicationIdx: bigint|undefined =
    process.env.TARGET_APPLICATION_IDX ? BigInt(process.env.TARGET_APPLICATION_IDX) : undefined;

const gRewardIntervalInHour = 1;
const gSensorDataPeriod = '1h';
const gRewardField = 'temp_0';  // Temperature 0
const gRewardAmount = '0.5';

//==========================================================================
// Setup global stuff
//==========================================================================
const gAppLogger = new AppLogger(gLoggerTag);
if (gNodeMode != 'production') {
  gAppLogger.setDebug(true);
}

//==========================================================================
// Get current gas price and increase it
//==========================================================================
function getGasPrice(aModifyPercent: bigint): Promise<bigint> {
  return new Promise(function(aFulfill, aReject) {
    ethers.provider.getFeeData()
        .then(aFeeData => {
          if (!aFeeData) {
            aReject(`getFeeData failed. No fee data.`);
          } else {
            if (aFeeData.gasPrice) {
              aFulfill(aFeeData.gasPrice * aModifyPercent / 100n);
            } else {
              aReject(`getFeeData failed. No gasPrice.`);
            }
          }
        })
        .catch(aErr => {
          aReject(`getFeeData failed. ${aErr.toString()}`);
        });
  });
}

//==========================================================================
//==========================================================================
function ChirpvmResult(aResp: AxiosResponse<any, any>): any {
  if (aResp.status != 200) {
    throw Error(`Get sensor data failed. Status=${aResp.status}`);
  }

  if (!Object.hasOwn(aResp.data, 'ret')) {
    throw Error('Invalid response. Missing ret.');
  }
  if (!aResp.data['ret']) {
    throw Error(`Server rejected. ${aResp.data['msg']}`)
  }
  if (!Object.hasOwn(aResp.data, 'result')) {
    throw Error('Invalid response. Missing ret.');
  }

  return aResp.data['result'];
}

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

//==========================================================================
//==========================================================================
async function polling_loop(aProxyMep802: Contract, aProxyMep804: MEP804v1) {
  for (;;) {
    gAppLogger.log(`Current Gas fee: ${ethers.formatEther(await getGasPrice(100n))}`);

    try {
      // Get all active sensor from application, with the targeted rewarding field.
      let resp = await axios.get(`${gChirpvmApiUrl}/application/${gTargetApplicationIdx}/${gRewardIntervalInHour}/${gRewardField}`);
      const result = ChirpvmResult(resp);
      if (!Array.isArray(result)) {
        throw Error('Invalid response. result is not a array.');
      }

      for (let i = 0; i < result.length; i++) {
        const chirpvm_data = result[i];
        if (!Object.hasOwn(chirpvm_data, 'pidZkevmHash')) {
          continue;
        }

        const pidZkevmHash = BigIntToHex(chirpvm_data['pidZkevmHash']);
        const token_owner =
            BigIntToHex(await aProxyMep802.getFunction('pidZkevmHashOwner').staticCallResult(pidZkevmHash) as unknown as string);

        // Get sensor statistic
        let resp_stat = await axios.get(`${gChirpvmApiUrl}/sensorData/${pidZkevmHash}/${gSensorDataPeriod}/mean`);
        const result_stat = ChirpvmResult(resp_stat);
        if (!Array.isArray(result)) {
          throw Error('Invalid response. result is not a array.');
        }

        const mep3355 = BlankMep3355();
        const sensor_content = JSON.stringify(result_stat);
        mep3355.metadata.data_source = 'ChirpVM';
        mep3355.metadata.data_collection_method = 'LoRaWAN';
        mep3355.data.push(Mep3355DataPrepare('sensor', sensor_content));

        const reward_amount = ethers.parseEther(gRewardAmount);
        const memo = JSON.stringify(mep3355);
        gAppLogger.log(`Sensor '${pidZkevmHash.substring(0, 16)}...' data ${sensor_content.length} bytes => MEP3355 ${memo.length} bytes.`);

        const feed_txn = await aProxyMep804.feedData(pidZkevmHash, token_owner, reward_amount, memo);
        await feed_txn.wait();

        gAppLogger.log(`Rewarded ${gRewardAmount} token to 0x${token_owner}.`);
      }

    } catch (aError) {
      gAppLogger.error(`getSensorData failed. ${aError}`);
    }

    await new Promise(res => setTimeout(() => res(null), gRewardIntervalInHour * 60 * 60 * 1000));
  }
}

//==========================================================================
// Main
//==========================================================================
async function main() {
  gAppLogger.log('====================');
  if (!gProxyAddressMep801) {
    gAppLogger.error('PROXY_MEP801 not set.');
    process.exit(1);
  }
  if (!gProxyAddressMep802) {
    gAppLogger.error('PROXY_MEP802 not set.');
    process.exit(1);
  }
  if (!gProxyAddressMep804) {
    gAppLogger.error('PROXY_MEP804 not set.');
    process.exit(1);
  }
  if (!gTargetApplicationIdx) {
    gAppLogger.error('TARGET_APPLICATION_IDX not set.');
    process.exit(1);
  }

  // Get owner
  const [signer] = await ethers.getSigners();

  // Show info
  gAppLogger.log(`Mode: ${gNodeMode}`);
  gAppLogger.log(`signer: ${signer.address}`);
  gAppLogger.log(`MEP801 Proxy: ${gProxyAddressMep801}`);
  gAppLogger.log(`MEP804 Proxy: ${gProxyAddressMep804}`);
  gAppLogger.log(`Target Application: ${gTargetApplicationIdx.toString()}`);
  gAppLogger.log(`ChirpVM: ${gChirpvmApiUrl}`);

  // Create a contract from address
  const mep804v1_factory = await ethers.getContractFactory('MEP804v1');
  const proxy_mep804 = mep804v1_factory.attach(gProxyAddressMep804) as MEP804v1;
  const proxy_mep801 = new Contract(gProxyAddressMep801, interface_mep801.abi, signer);
  const proxy_mep802 = new Contract(gProxyAddressMep802, interface_mep802.abi, signer);

  gAppLogger.log(`MEP801 name: ${await proxy_mep801.name()}`);
  gAppLogger.log(`MEP802 name: ${await proxy_mep802.name2()}`);
  gAppLogger.log(`MEP804 name: ${await proxy_mep804.name2()}`);
  gAppLogger.log(`Token name: ${await proxy_mep804.name()}`);

  polling_loop(proxy_mep802, proxy_mep804);
}

// Catch any erro
main().catch(aError => {
  console.error(aError.toString());
  process.exit(1);
});