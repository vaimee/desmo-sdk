/**
 * @file Test suite, using Mocha and Chai.
 * Compiled files inside the 'test' folder are excluded from
 * published npm projects.
 */

import { expect } from 'chai';

import { DesmoContract, DesmoHub, IRequestIDEvent } from '..';
import { WalletSignerInfura } from '@/walletSigner/walletSignerInfura-module';
import 'mocha';
import { chainURL, privateKEY } from './config';
import { firstValueFrom } from 'rxjs';

describe('DesmoContract Tests', function () {
  const walletSigner: WalletSignerInfura = new WalletSignerInfura(chainURL);
  walletSigner.signInWithPrivateKey(privateKEY); //remember to delete if you push to github

  const desmohub: DesmoHub = new DesmoHub(walletSigner);
  const buyer: DesmoContract = new DesmoContract(walletSigner);

  /* We have to put all async initialisation code
   * inside a 'before' block because 'mocha' doesn't
   * support an async function when it is the argument
   * of a 'describe' block:
   */
  before(async function () {
    await desmohub.startListeners();
  });

  after(function () {
    desmohub.stopListeners();
  });

  beforeEach((done) => setTimeout(done, 20000));

  describe('Buy query process', function () {
    it('should buy a query', async () => {
      await desmohub.getNewRequestID();

      const event: IRequestIDEvent = await firstValueFrom(desmohub.requestID$);
      await buyer.buyQuery(event.requestID, 'test query');

      // TODO
    });

    it('should retrieve the query result from chain', async () => {
      const result = await buyer.getQueryResult();
      console.log(result);
    });
  });

  describe('Callback address verification process', function () {
    it('should verify callback address', async () => {
      // await desmohub.getNewRequestID();

      // const event: IRequestIDEvent = await firstValueFrom(desmohub.requestID$);
      // await buyer.buyQuery(event.requestID, 'test query');
      // await buyer.verifyCallbackAddress(
      //   '0x0f04bC57374f9F8c705636142CEFf953e33a7249',
      // );
    });
  });
});