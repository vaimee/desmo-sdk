import { expect } from 'chai';

import { DesmoContract, DesmoHub } from '..';
import { WalletSignerInfura } from '@/walletSigner/walletSignerInfura-module';
import 'mocha';
import { chainURL, privateKEY } from './common';

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

  describe('Query buy process', function () {
    // it('should buy query', async () => {
    //   desmohub.requestID$
    //     .pipe(take(1))
    //     .subscribe(async (event: IRequestIDEvent) => {
    //       await buyer.buyQuery(event.requestID.toString(), 'test');
    //     });
    //   await desmohub.getNewRequestID();
    // });
    // it('should retrieve result from chain', async () => {
    //   const result = await buyer.getQueryResult();
    //   console.log(result);
    // });
  });

  describe('Get TDDs By Request ID', function () {
    it('Should retrieve TDDs', async () => {
      /** */
    });
  });

  // describe('Callback address verification process', function () {
  //   it('should verify callback address', async () => {
  //     desmohub.requestID$
  //       .pipe(take(1))
  //       .subscribe(async (event: IRequestIDEvent) => {
  //         await buyer.buyQuery(event.requestID.toString(), 'test');
  //         await buyer.verifyCallbackAddress(
  //           '0x0f04bC57374f9F8c705636142CEFf953e33a7249',
  //         );
  //       });
  //     await desmohub.getNewRequestID();
  //   });
  // });
});
