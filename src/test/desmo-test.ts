import { Desmo } from '@/desmo-module';
import { DesmoHub } from '@/desmoHub-module';
import { IRequestIDEvent } from '$/types/desmoHub-types';
import { WalletSignerJsonRpc } from '@/walletSigner/walletSignerJsonRpc-module';
import { QueryResultTypes } from '@/utils/decoder';
import {
  abi as DesmoABI,
  bytecode as DesmoBytecode,
} from '$/resources/desmo-config';
import {
  abi as DesmoHubABI,
  bytecode as DesmoHubBytecode,
} from '$/resources/desmoHub-config';

import { MockProvider } from '@ethereum-waffle/provider';
import { getMockIExecContract, getMockIExecSDK } from './iexec-mock';

import { ethers, ContractFactory } from 'ethers';
import { firstValueFrom } from 'rxjs';

import 'mocha';
import chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
chai.use(ChaiAsPromised);

async function setup(): Promise<{
  account: ethers.Wallet;
  desmoHubContract: ethers.Contract;
  desmoContract: ethers.Contract;
}> {
  const wallets = new MockProvider().getWallets(); // Returns 10 different wallets

  const desmoHubContractFactory = new ContractFactory(
    DesmoHubABI,
    DesmoHubBytecode,
    wallets[0],
  );
  const desmoHubContract = await desmoHubContractFactory.deploy();

  for (let i = 0; i < 4; i++) {
    const account = wallets[i];
    const url = `https://desmold-zion-${i + 1}.vaimee.it`;
    const tx = await desmoHubContract.connect(account).registerTDD(url, {
      from: account.address,
    });
    await tx.wait();
  }

  const iexecProxy = await getMockIExecContract(wallets[0]);
  const desmoContractFactory = new ContractFactory(
    DesmoABI,
    DesmoBytecode,
    wallets[0],
  );
  const desmoContract = await desmoContractFactory.deploy(
    desmoHubContract.address,
    iexecProxy.address,
  );

  return { account: wallets[0], desmoHubContract, desmoContract };
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
  before(async function () {
    const { account, desmoHubContract, desmoContract } = await setup();

    walletSigner = new WalletSignerJsonRpc('');
    walletSigner['_wallet'] = account;
    (walletSigner as any)['_provider'] = account.provider;
    walletSigner.signInWithPrivateKey(account.privateKey);

    desmohub = new DesmoHub(walletSigner);
    desmohub['contract'] = desmoHubContract;
    desmohub['abiInterface'] = new ethers.utils.Interface(DesmoHubABI);

    desmo = new Desmo(walletSigner);
    desmo['contract'] = desmoContract;
    desmo['abiInterface'] = new ethers.utils.Interface(DesmoABI);
    if (desmo['iexec'] !== undefined) {
      desmo['iexec'] = getMockIExecSDK(
        desmo['iexec'],
        account,
        '0x11391F354CFE180cBc2C92e186e691B63CEB4763',
      );
    }

    await desmohub.startListeners();
  });

  after(function () {
    desmohub.stopListeners();
  });

  describe('Buy query process', function () {
    it('should buy a query and retrieve its result', async () => {
      const eventPromise = firstValueFrom(desmohub.requestID$);
      await desmohub.getNewRequestID();
      const event: IRequestIDEvent = await eventPromise;
      const query =
        '{__!_prefixList__!_:[{__!_abbreviation__!_:__!_desmo__!_,__!_completeURI__!_:__!_https://desmo.vaimee.it/__!_},{__!_abbreviation__!_:__!_qudt__!_,__!_completeURI__!_:__!_http://qudt.org/schema/qudt/__!_},{__!_abbreviation__!_:__!_xsd__!_,__!_completeURI__!_:__!_http://www.w3.org/2001/XMLSchema/__!_},{__!_abbreviation__!_:__!_monas__!_,__!_completeURI__!_:__!_https://pod.dasibreaker.vaimee.it/monas/__!_}],__!_property__!_:{__!_identifier__!_:__!_value__!_,__!_unit__!_:__!_qudt:DEG_C__!_,__!_datatype__!_:1},__!_staticFilter__!_:__!_$[?(@[--#-type--#-]==--#-Sensor--#-)]__!_}';
      await desmo.buyQuery(
        event.requestID,
        query,
        '0x11391F354CFE180cBc2C92e186e691B63CEB4763',
      );

      const { result, type } = await desmo.getQueryResult();

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
});
