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
  walletSigner.signInWithPrivateKey(privateKEY);

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
      const query =
        '{__!_prefixList__!_:[{__!_abbreviation__!_:__!_desmo__!_,__!_completeURI__!_:__!_https://desmo.vaimee.it/__!_},{__!_abbreviation__!_:__!_qudt__!_,__!_completeURI__!_:__!_http://qudt.org/schema/qudt/__!_},{__!_abbreviation__!_:__!_xsd__!_,__!_completeURI__!_:__!_http://www.w3.org/2001/XMLSchema/__!_},{__!_abbreviation__!_:__!_monas__!_,__!_completeURI__!_:__!_https://pod.dasibreaker.vaimee.it/monas/__!_}],__!_property__!_:{__!_identifier__!_:__!_value__!_,__!_unit__!_:__!_qudt:DEG_C__!_,__!_datatype__!_:1},__!_staticFilter__!_:__!_$[?(@[--#-type--#-]==--#-Sensor--#-)]__!_}';
      await buyer.buyQuery(
        event.requestID,
        query,
        '0x11391F354CFE180cBc2C92e186e691B63CEB4763',
      );

      const { result, type } = await buyer.getQueryResult();

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
