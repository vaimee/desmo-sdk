/**
 * @file Test suite, using Mocha and Chai.
 * Compiled files inside the 'test' folder are excluded from
 * published npm projects.
 * (Note that fs-extra is added as a dev dependency to make
 * sandbox setup much easier. If you aren't using a sandbox
 * you can remove this dependency. If you need fs-extra for
 * your main code, move it into the regular 'dependencies'
 * section of your package.json file)
 */

import { expect } from 'chai';
import fs from 'fs-extra';
import { take } from 'rxjs';
import {
  DesmoContract,
  DesmoHub,
  IRequestIDEvent,
  ITDDDisabledEvent,
  ITDDEnabledEvent,
  ITDDRetrievalEvent, ITDDSubsetEvent,
} from '..';
import { WalletSignerInfura } from '@/walletSignerInfura-module';
import 'mocha';
const sandboxRoot = './sandbox';
const samplesRoot = './samples';
const infuraURL = 'https://viviani.iex.ec'; // Replace with your own Infura URL
const privateKEY = ''; // Replace with your own private key
const MYTDD = 'https://www.desmo.vaimee.it/2019/wot/tdd/v1/TDD:001'; // Replace with your own TDD for tests

/**
 * Clone any files in a "./samples" folder into
 * a "./sandbox" folder, overwriting any files
 * currently in there. This is useful for allowing
 * your test suite to make changes to files without
 * changing the originals, so that you can easily
 * reset back to an original state prior to running a test.
 */
function resetSandbox() {
  if (!fs.existsSync(samplesRoot)) {
    // Then no samples exist, and no sandbox needed
    return;
  }
  fs.ensureDirSync(sandboxRoot);
  fs.emptyDirSync(sandboxRoot);
  fs.copySync(samplesRoot, sandboxRoot);
}

describe('Test Suite', function () {
  before(function () {
    resetSandbox();
  });

  //beforeEach((done) => setTimeout(done, 20000));

  /***TESTS FOR THE DESMO-HUB***/

  describe('DesmoHub Tests', function () {
    const walletSigner: WalletSignerInfura = new WalletSignerInfura(infuraURL);
    walletSigner.signInWithPrivateKey(privateKEY); //remember to delete if you push to github

    const desmohub: DesmoHub = new DesmoHub(walletSigner);
    const myTDD: string = MYTDD;

    /* We have to put all async initialisation code
     * inside a 'before' block because 'mocha' doesn't
     * support an async function when it is the argument
     * of a 'describe' block:
     */
    before(async function () {
      //start all listeners
      await desmohub.startListeners();
      //await desmohub.registerTDD(myTDD);
    });

    after(function () {
      desmohub.stopListeners();
    });

    describe('Retrieve', function () {
      it('should retrieve a tdd', async () => {
        desmohub.tddRetrieval$
          .pipe(take(1))
          .subscribe((event: ITDDRetrievalEvent) => {
            expect(event.url).to.equal(myTDD);
          });
        await desmohub.getTDD();
      });
    });

    // disable
    describe('Disable', function () {
      it('should disable a tdd', async () => {
        desmohub.tddDisabled$
          .pipe(take(1))
          .subscribe((event: ITDDDisabledEvent) => {
            expect(event.url).to.equal(myTDD);
          });
        await desmohub.disableTDD();
      });

      // retrieve tdd after enable
      it('should have a disabled tdd', async () => {
        desmohub.tddRetrieval$
          .pipe(take(1))
          .subscribe((event: ITDDRetrievalEvent) => {
            expect(event.disabled).to.be.true;
          });
        await desmohub.getTDD();
      });
    });

    //enable
    describe('Enable', function () {
      it('should enable a tdd', async () => {
        desmohub.tddEnabled$
          .pipe(take(1))
          .subscribe((event: ITDDEnabledEvent) => {
            expect(event.url).to.equal(myTDD);
          });
        await desmohub.enableTDD();
      });

      // retrieve tdd after enable
      it('should have an enabled tdd', async () => {
        desmohub.tddRetrieval$
          .pipe(take(1))
          .subscribe((event: ITDDRetrievalEvent) => {
            expect(event.disabled).to.be.false;
          });
        await desmohub.getTDD();
      });
    });

    describe('TDDs Request ID', function (){
      // let ID: number;
      // it("Should retrieve ID ", async () => {
      //   desmohub.requestID$
      //       .pipe(take(1))
      //       .subscribe((event: IRequestIDEvent) => {
      //         //expect(event.requestID).to.be.false;
      //         ID = event.requestID;
      //       });
      //   await desmohub.getTDD();
      // });

      it("Should retrieve TDD list", async () => {
        console.log("Ciao");

        desmohub.requestID$
            .pipe(take(1))
            .subscribe(async (event: IRequestIDEvent) => {
              //expect(event.requestID).to.be.false;
              console.log(event.requestID);
              await desmohub.getTDDByRequestID(event.requestID.toString());

            });

        desmohub.tddSubset$
            .pipe(take(1))
            .subscribe((event: ITDDSubsetEvent) => {
              //Dexpect(event.requestID).to.be.false;
              console.log(event.subset);
            });
        await desmohub.getNewRequestID();
      });
    });
  });

  /***TESTS FOR THE DESMO-CONTRACT***/
  //
  // describe('DESMO Contract Tests', function () {
  //   const walletSigner: WalletSignerInfura = new WalletSignerInfura(infuraURL);
  //   walletSigner.signInWithPrivateKey(privateKEY); //remember to delete if you push to github
  //
  //   const desmohub: DesmoHub = new DesmoHub(walletSigner);
  //   const buyer: DesmoContract = new DesmoContract(walletSigner);
  //
  //   /* We have to put all async initialisation code
  //    * inside a 'before' block because 'mocha' doesn't
  //    * support an async function when it is the argument
  //    * of a 'describe' block:
  //    */
  //   before(async function () {
  //     await desmohub.startListeners();
  //   });
  //
  //   after(function () {
  //     desmohub.stopListeners();
  //   });
  //
  //   describe('Query buy process', function () {
  //     it('should buy query', async () => {
  //       desmohub.requestID$
  //         .pipe(take(1))
  //         .subscribe(async (event: IRequestIDEvent) => {
  //           await buyer.buyQuery(event.requestID.toString(), 'test');
  //         });
  //       await desmohub.getNewRequestID();
  //     });
  //
  //     it('should retrieve result from chain', async () => {
  //       const result = await buyer.getQueryResult();
  //       console.log(result);
  //     });
  //   });
  //
  //   // describe('Callback address verification process', function () {
  //   //   it('should verify callback address', async () => {
  //   //     desmohub.requestID$
  //   //       .pipe(take(1))
  //   //       .subscribe(async (event: IRequestIDEvent) => {
  //   //         await buyer.buyQuery(event.requestID.toString(), 'test');
  //   //         await buyer.verifyCallbackAddress(
  //   //           '0x0f04bC57374f9F8c705636142CEFf953e33a7249',
  //   //         );
  //   //       });
  //   //     await desmohub.getNewRequestID();
  //   //   });
  //   // });
  // });

  after(function () {
    resetSandbox();
  });
});
