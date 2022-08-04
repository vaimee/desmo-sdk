import { expect } from 'chai';
import { take } from 'rxjs';
import {
  DesmoHub,
  IRequestIDEvent,
  ITDDDisabledEvent,
  ITDDEnabledEvent,
} from '..';
import { WalletSignerInfura } from '@/walletSigner/walletSignerInfura-module';
import 'mocha';
import { chainURL, myTDDUrl, privateKEY } from './common';

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
  });

  describe('Disable', function () {
    it('should disable my TDD', async () => {
      desmohub.tddDisabled$
        .pipe(take(1))
        .subscribe((event: ITDDDisabledEvent) => {
          expect(event.url).to.equal(myTDDUrl);
        });
      await desmohub.disableTDD();
    });

    // retrieve TDD after having disabled it
    it('should have disabled my TDD', async () => {
      const myTDDObject = await desmohub.getTDD();
      expect(myTDDObject.disabled).to.be.true;
    });
  });

  describe('Enable', function () {
    it('should enable a tdd', async () => {
      desmohub.tddEnabled$
        .pipe(take(1))
        .subscribe((event: ITDDEnabledEvent) => {
          expect(event.url).to.equal(myTDDUrl);
        });
      await desmohub.enableTDD();
    });

    // retrieve TDD after having enabled it
    it('should have enabled my TDD', async () => {
      const myTDDObject = await desmohub.getTDD();
      expect(myTDDObject.disabled).to.be.false;
    });
  });

  describe('TDDs Request ID', function () {
    it('should retrieve a newly-generated request ID', async () => {
      desmohub.requestID$
        .pipe(take(1))
        .subscribe((event: IRequestIDEvent) => {
          expect(event.requestID.length > 0);
        });
      await desmohub.getNewRequestID();
    });

    it('should retrieve the newly-generated list of selected TDDs', async () => {
      desmohub.requestID$
        .pipe(take(1))
        .subscribe(async (event: IRequestIDEvent) => {
          const selectedTDDs = await desmohub.getTDDByRequestID(
            event.requestID,
          );
          expect(selectedTDDs.length > 0);
        });

      await desmohub.getNewRequestID();
    });
  });
});
