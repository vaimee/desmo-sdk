/**
 * @file Test suite, using Mocha and Chai.
 * Compiled files inside the 'test' folder are excluded from
 * published npm projects.
 */

import { firstValueFrom } from 'rxjs';
import {
  DesmoHub,
  IRequestIDEvent,
  ITDDDisabledEvent,
  ITDDEnabledEvent,
} from '..';
import { WalletSignerInfura } from '@/walletSigner/walletSignerInfura-module';
import 'mocha';
import { chainURL, myTDDUrl, privateKEY } from './config';
import { expect } from 'chai';

describe('DesmoHub Tests', function () {
  const walletSigner: WalletSignerInfura = new WalletSignerInfura(chainURL);
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
      await desmohub.disableTDD();

      const event: ITDDDisabledEvent = await firstValueFrom(
        desmohub.tddDisabled$,
      );
      expect(event.url).to.equal(myTDDUrl);

      const myTDDObject = await desmohub.getTDD();
      expect(myTDDObject.disabled).to.be.true;
    });
  });

  describe('Enable', function () {
    it('should enable a tdd', async () => {
      await desmohub.enableTDD();

      const event: ITDDEnabledEvent = await firstValueFrom(
        desmohub.tddEnabled$,
      );
      expect(event.url).to.equal(myTDDUrl);

      const myTDDObject = await desmohub.getTDD();
      expect(myTDDObject.disabled).to.be.false;
    });
  });

  describe('TDDs Request ID', function () {
    it('should retrieve a newly-generated request ID', async () => {
      await desmohub.getNewRequestID();

      const event: IRequestIDEvent = await firstValueFrom(desmohub.requestID$);
      expect(event.requestID.length == 64 + 2); // 64 c
    });

    it('should retrieve the newly-generated list of selected TDDs', async () => {
      await desmohub.getNewRequestID();

      const event: IRequestIDEvent = await firstValueFrom(desmohub.requestID$);
      const selectedTDDs = await desmohub.getTDDByRequestID(event.requestID);
      expect(selectedTDDs.length > 0);
    });

    it('should retrieve the scores of the newly-generated list of selected TDDs', async () => {
      await desmohub.getNewRequestID();

      const event: IRequestIDEvent = await firstValueFrom(desmohub.requestID$);
      const tddScores = await desmohub.getScoresByRequestID(event.requestID);
      expect(tddScores.length > 0);
    });
  });
});
