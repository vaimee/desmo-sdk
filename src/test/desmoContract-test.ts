/**
 * @file Test suite, using Mocha and Chai.
 * Compiled files inside the 'test' folder are excluded from
 * published npm projects.
 */

import { expect } from 'chai';

import { DesmoContract, DesmoHub, IRequestIDEvent } from '..';
import { WalletSignerJsonRpc } from '@/walletSigner/walletSignerJsonRpc-module';
import 'mocha';
import { chainURL, privateKEY } from './config';
import { firstValueFrom } from 'rxjs';

describe('DesmoContract Tests', function () {
  const walletSigner: WalletSignerJsonRpc = new WalletSignerJsonRpc(chainURL);
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
      const eventPromise = firstValueFrom(desmohub.requestID$);
      await desmohub.getNewRequestID();
      const event: IRequestIDEvent = await eventPromise;

      await buyer.buyQuery(event.requestID, 'test query', '0x7529d35aD28eee02De4C1B3E5f8457ecce704775');

      // TODO
    });

    it('should retrieve the query result from chain', async () => {
      const result = await buyer.getQueryResult();
      console.log(result);
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
