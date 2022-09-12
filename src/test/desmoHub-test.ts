import { DesmoHub } from '@/desmoHub-module';
import {
  IRequestIDEvent,
  ITDDDisabledEvent,
  ITDDEnabledEvent,
} from '$/types/desmoHub-types';
import { abi as DesmoHubABI } from '@vaimee/desmo-contracts/artifacts/contracts/DesmoHub.sol/DesmoHub.json'
import { WalletSignerJsonRpc } from '@/walletSigner/walletSignerJsonRpc-module';
import { setupMockEnvironment } from './iexec-mock';

import { ethers } from 'ethers';
import { firstValueFrom } from 'rxjs';

import 'mocha';
import chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
chai.use(ChaiAsPromised);

describe('DesmoHub Tests', function () {
  let desmohub: DesmoHub;
  let walletSigner: WalletSignerJsonRpc;

  /* We have to put all async initialisation code
   * inside a 'before' block because 'mocha' doesn't
   * support an async function when it is the argument
   * of a 'describe' block:
   */
  before(async function () {
    const { account, desmoHubContract } = await setupMockEnvironment();

    walletSigner = new WalletSignerJsonRpc('');
    walletSigner['_wallet'] = account;
    (walletSigner as any)['_provider'] = account.provider;
    walletSigner.signInWithPrivateKey(account.privateKey);

    desmohub = new DesmoHub(walletSigner);
    desmohub['contract'] = desmoHubContract;
    desmohub['abiInterface'] = new ethers.utils.Interface(DesmoHubABI);

    //start all listeners
    await desmohub.startListeners();
  });

  after(function () {
    desmohub.stopListeners();
  });

  describe('Retrieve TDD list', function () {
    it('should retrieve a list of 3 selected TDDs', async () => {
      const start = 1;
      const stop = 4;
      const tddList = await desmohub.getTDDList(start, stop);
      expect(tddList.length).to.equal(3);
    });

    it('should retrieve an empty list of TDDs if start and stop indexes are equal', async () => {
      const start = 1;
      const stop = 1;
      const tddList = await desmohub.getTDDList(start, stop);
      expect(tddList.length).to.equal(0);
    });

    it('should fail if start index is higher than stop index', async () => {
      const start = 3;
      const stop = 1;
      await expect(desmohub.getTDDList(start, stop)).to.be.rejectedWith(
        `Start index (${start}) is greater than stop index (${stop}).`,
      );
    });

    it('should fail if start index is greater or equal to the length of TDD storage', async () => {
      const tddStorageLength = (
        await desmohub.getTDDStorageLength()
      ).toNumber();
      await expect(desmohub.getTDDList(tddStorageLength)).to.be.rejectedWith(
        `Start index must be lower than the TDD storage length (${tddStorageLength}).`,
      );
      await expect(
        desmohub.getTDDList(tddStorageLength + 1),
      ).to.be.rejectedWith(
        `Start index must be lower than the TDD storage length (${tddStorageLength}).`,
      );
    });
  });

  describe('Retrieve', function () {
    it('should retrieve my TDD', async () => {
      const myTDDObject = await desmohub.getTDD();
      expect(myTDDObject.url).to.equal('https://desmold-zion-1.vaimee.it');
    });

    it('should retrieve the TDD storage length', async () => {
      const lengthBigNumber = await desmohub.getTDDStorageLength();
      expect(lengthBigNumber.gte(0));
    });
  });

  describe('Disable', function () {
    it('should disable my TDD', async () => {
      const eventPromise = firstValueFrom(desmohub.tddDisabled$);
      await desmohub.disableTDD();
      const event: ITDDDisabledEvent = await eventPromise;

      expect(event.url).to.equal('https://desmold-zion-1.vaimee.it');

      const myTDDObject = await desmohub.getTDD();
      expect(myTDDObject.disabled).to.be.true;
    });
  });

  describe('Enable', function () {
    it('should enable a tdd', async () => {
      const eventPromise = firstValueFrom(desmohub.tddEnabled$);
      await desmohub.enableTDD();
      const event: ITDDEnabledEvent = await eventPromise;

      expect(event.url).to.equal('https://desmold-zion-1.vaimee.it');

      const myTDDObject = await desmohub.getTDD();
      expect(myTDDObject.disabled).to.be.false;
    });
  });

  describe('TDDs Request ID', function () {
    it('should retrieve a newly-generated request ID', async () => {
      const eventPromise = firstValueFrom(desmohub.requestID$);
      await desmohub.getNewRequestID();
      const event: IRequestIDEvent = await eventPromise;

      expect(event.requestID.length == 64 + 2); // length of '0x' + 32 bytes hex value
    });

    it('should retrieve the newly-generated list of selected TDDs', async () => {
      const eventPromise = firstValueFrom(desmohub.requestID$);
      await desmohub.getNewRequestID();
      const event: IRequestIDEvent = await eventPromise;

      const selectedTDDs = await desmohub.getTDDByRequestID(event.requestID);
      expect(selectedTDDs.length > 0);
    });

    it('should retrieve the scores of the newly-generated list of selected TDDs', async () => {
      const eventPromise = firstValueFrom(desmohub.requestID$);
      await desmohub.getNewRequestID();
      const event: IRequestIDEvent = await eventPromise;

      const tddScores = await desmohub.getScoresByRequestID(event.requestID);
      expect(tddScores.length > 0);
    });
  });
});
