import { expect } from 'chai';

import { Desmo } from '../lib/desmo-module';
import { DesmoHub } from '../lib/desmoHub-module';
import { IRequestIDEvent } from '../types/desmoHub-types';
import { WalletSignerJsonRpc } from '@/walletSigner/walletSignerJsonRpc-module';
import 'mocha';
import { chainURL, privateKEY } from './config';
import { firstValueFrom } from 'rxjs';

describe('Desmo Tests', function () {
  const walletSigner: WalletSignerJsonRpc = new WalletSignerJsonRpc(chainURL);
  walletSigner.signInWithPrivateKey(privateKEY); //remember to delete if you push to github

  const desmohub: DesmoHub = new DesmoHub(walletSigner);
  const buyer: Desmo = new Desmo(walletSigner);

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

  describe('Buy query process', function () {
    it('should buy a query and retrieve its result', async () => {
      const eventPromise = firstValueFrom(desmohub.requestID$);
      await desmohub.getNewRequestID();
      const event: IRequestIDEvent = await eventPromise;

      const query = {
        prefixList: [
          { abbreviation: 'desmo', completeURI: 'https://desmo.vaimee.it/' },
          { abbreviation: 'qudt', completeURI: 'http://qudt.org/schema/qudt/' },
          {
            abbreviation: 'xsd',
            completeURI: 'http://www.w3.org/2001/XMLSchema/',
          },
          {
            abbreviation: 'monas',
            completeURI: 'https://pod.dasibreaker.vaimee.it/monas/',
          },
        ],
        property: { identifier: 'value', unit: 'qudt:DEG_C', datatype: 1 },
        staticFilter: '$[?(@["type"]=="Sensor")]',
      };
      await buyer.buyQuery(
        event.requestID,
        JSON.stringify(query),
        '0x7529d35aD28eee02De4C1B3E5f8457ecce704775',
      );

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
