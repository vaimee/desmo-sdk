import { firstValueFrom } from 'rxjs';
import { DesmoHub } from '../lib/desmoHub-module';
import {
  IRequestIDEvent,
  ITDDDisabledEvent,
  ITDDEnabledEvent,
} from '../types/desmoHub-types';
import { WalletSignerJsonRpc } from '@/walletSigner/walletSignerJsonRpc-module';
import 'mocha';
import { chainURL, myTDDUrl, privateKEY } from './config';
import { expect } from 'chai';

describe('DesmoHub Tests', function () {
  const walletSigner: WalletSignerJsonRpc = new WalletSignerJsonRpc(chainURL);
  walletSigner.signInWithPrivateKey(privateKEY);

  const desmohub: DesmoHub = new DesmoHub(walletSigner);

  /* We have to put all async initialisation code
   * inside a 'before' block because 'mocha' doesn't
   * support an async function when it is the argument
   * of a 'describe' block:
   */
  before(async function () {
    //start all listeners
    await desmohub.startListeners();
  });

  after(function () {
    desmohub.stopListeners();
  });

  describe('Retrieve', function () {
    it('should retrieve my TDD', async () => {
      const myTDDObject = await desmohub.getTDD();
      expect(myTDDObject.url).to.equal(myTDDUrl);
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

      expect(event.url).to.equal(myTDDUrl);

      const myTDDObject = await desmohub.getTDD();
      expect(myTDDObject.disabled).to.be.true;
    });
  });

  describe('Enable', function () {
    it('should enable a tdd', async () => {
      const eventPromise = firstValueFrom(desmohub.tddEnabled$);
      await desmohub.enableTDD();
      const event: ITDDEnabledEvent = await eventPromise;

      expect(event.url).to.equal(myTDDUrl);

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
