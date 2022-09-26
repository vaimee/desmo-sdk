import { Desmo } from '@/desmo-module';
import { DesmoHub } from '@/desmoHub-module';
import { IRequestIDEvent } from '$/types/desmoHub-types';
import { WalletSignerJsonRpc } from '@/walletSigner/walletSignerJsonRpc-module';
import { QueryResultTypes } from '@/utils/decoder';
import { abi as DesmoABI } from '@vaimee/desmo-contracts/artifacts/contracts/Desmo.sol/Desmo.json';
import { abi as DesmoHubABI } from '@vaimee/desmo-contracts/artifacts/contracts/DesmoHub.sol/DesmoHub.json';
import { Desmo as DesmoContract } from '@vaimee/desmo-contracts/typechain/Desmo';
import { getMockIExecSDK, setupMockEnvironment } from './iexec-mock';

import { ethers } from 'ethers';
import { firstValueFrom } from 'rxjs';

import 'mocha';
import chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
chai.use(ChaiAsPromised);

async function query(
  desmo: Desmo,
  desmoHub: DesmoHub
): Promise<ReturnType<Desmo['getQueryResult']>> {
  const eventPromise = firstValueFrom(desmoHub.requestID$);
  await desmoHub.getNewRequestID();
  const event: IRequestIDEvent = await eventPromise;
  const query =
    '{__!_prefixList__!_:[{__!_abbreviation__!_:__!_desmo__!_,__!_completeURI__!_:__!_https://desmo.vaimee.it/__!_},{__!_abbreviation__!_:__!_qudt__!_,__!_completeURI__!_:__!_http://qudt.org/schema/qudt/__!_},{__!_abbreviation__!_:__!_xsd__!_,__!_completeURI__!_:__!_http://www.w3.org/2001/XMLSchema/__!_},{__!_abbreviation__!_:__!_monas__!_,__!_completeURI__!_:__!_https://pod.dasibreaker.vaimee.it/monas/__!_}],__!_property__!_:{__!_identifier__!_:__!_value__!_,__!_unit__!_:__!_qudt:DEG_C__!_,__!_datatype__!_:1},__!_staticFilter__!_:__!_$[?(@[--#-type--#-]==--#-Sensor--#-)]__!_}';
  await desmo.buyQuery(
    event.requestID,
    query,
    '0x11391F354CFE180cBc2C92e186e691B63CEB4763'
  );

  return desmo.getQueryResult();
}

describe('Desmo Tests', function () {
  let desmohub: DesmoHub;
  let desmo: Desmo;
  let walletSigner: WalletSignerJsonRpc;

  /* We have to put all async initialisation code
   * inside a 'before' block because 'mocha' doesn't
   * support an async function when it is the argument
   * of a 'describe' block:
   */
  beforeEach(async function () {
    const { account, desmoHubContract, desmoContract } =
      await setupMockEnvironment();

    walletSigner = new WalletSignerJsonRpc('');
    walletSigner['_wallet'] = account;
    (walletSigner as any)['_provider'] = account.provider;
    walletSigner.signInWithPrivateKey(account.privateKey);

    desmohub = new DesmoHub(walletSigner);
    desmohub['contract'] = desmoHubContract;
    desmohub['abiInterface'] = new ethers.utils.Interface(DesmoHubABI);

    desmo = new Desmo(walletSigner);
    desmo['contract'] = desmoContract as DesmoContract;
    desmo['abiInterface'] = new ethers.utils.Interface(DesmoABI);
    if (desmo['iexec'] !== undefined) {
      desmo['iexec'] = getMockIExecSDK(
        desmo['iexec'],
        account,
        '0x11391F354CFE180cBc2C92e186e691B63CEB4763'
      );
    }

    await desmohub.startListeners();
  });

  afterEach(function () {
    desmohub.stopListeners();
  });

  describe('Buy query process', function () {
    it('should buy a query and retrieve its result', async () => {
      const { result, type } = await query(desmo, desmohub);

      expect(result).to.be.a('number');
      expect(type).to.be.equal(QueryResultTypes.POS_FLOAT);
    });
  });

  describe('Callback address verification process', function () {
    it('should verify callback address', async () => {
      // const eventPromise = firstValueFrom(desmohub.requestID$);
      // await desmohub.getNewRequestID();
      // const event: IRequestIDEvent = await eventPromise;
      // await buyer.buyQuery(event.requestID, 'test query');
      // await buyer.verifyCallbackAddress(
      //   '0x0f04bC57374f9F8c705636142CEFf953e33a7249',
      // );
    });
  });

  describe('List query transactions', () => {
    it('should be an empty list', async () => {
      const list = await desmo.listTransactions();

      expect(list.length).to.be.eql(0);
    });

    it('should contain one correct transaction', async () => {
      await query(desmo, desmohub);
      const list = await desmo.listTransactions();

      expect(list.length).to.be.eql(1);
      expect(list[0].requestID).to.not.be.undefined;
      expect(list[0].transaction).to.not.be.undefined;
      expect(list[0].taskID).to.not.be.undefined;
      expect(list[0].result).to.not.be.undefined;
    });

    it('should contain more than one transaction', async () => {
      await query(desmo, desmohub);
      await query(desmo, desmohub);
      const list = await desmo.listTransactions();

      expect(list.length).to.be.eql(2);
      expect(list[0]).to.not.be.undefined;
      expect(list[1]).to.not.be.undefined;
    });

    it('should retrieve an empty list if fromBlock and toBlock are equal', async () => {
      const list = await desmo.listTransactions(1, 1);

      expect(list.length).to.be.eql(0);
    });

    it('should fail if fromBlock is higher than toBlock', async () => {
      const from = 2;
      const to = 1;
      await expect(desmo.listTransactions(from, to)).to.be.rejectedWith(
        `fromBlock (${from}) must be lower than toBlock (${to}).`
      );
    });

    it('should fail if fromBlock is greater or equal to current block number', async () => {
      const currBlockNumber = await desmo.provider.getBlockNumber();
      await expect(desmo.listTransactions(currBlockNumber)).to.be.rejectedWith(
        `fromBlock (${currBlockNumber}) must be lower than the current block number (${currBlockNumber}).`
      );
      await expect(
        desmo.listTransactions(currBlockNumber + 1)
      ).to.be.rejectedWith(
        `fromBlock (${
          currBlockNumber + 1
        }) must be lower than the current block number (${currBlockNumber}).`
      );
    });
  });
});
