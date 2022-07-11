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

import { expect } from "chai";
import fs from "fs-extra";
import { Subscription } from "rxjs";
import { DesmoHub } from "..";

const sandboxRoot = "./sandbox";
const samplesRoot = "./samples";
const infuraURL = ""; // Replace with your own Infura URL
const privateKEY = ""; // Replace with your own private key
const MYTDD = ""; // Replace with your own TDD for tests

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

describe("Test Suite", function () {

  before(function () {
    resetSandbox();
  });

  describe("Test Group", function () {
    it("can do something", function () {
      resetSandbox();
      expect(true).to.be.true;
    });
  });

  /***TESTS FOR THE DESMO-HUB***/

  describe('DesmoHub Tests', function () {
    const desmohub: DesmoHub = new DesmoHub(infuraURL);
    desmohub.signInWithPrivateKey(privateKEY); //rembember to delete if you push to github
    const myTDD = MYTDD;
    
    //start all listeners
    desmohub.startListeners();

    describe('Retrieve', function () {
      it('should retrieve a tdd', function (done) {
        desmohub.getTDD();
        const subscription: Subscription = desmohub.tddRetrieval$.subscribe((event) => {
          expect(event.url).to.equal(myTDD);
          done();
          //desmohub.stopListeners();
          subscription.unsubscribe();
        });

      });

    });

    // disable
    describe('Disable', function () {
      it('should disable a tdd', function (done) {

        //desmohub.startListeners();
        desmohub.disableTDD();
        const subscription: Subscription = desmohub.tddDisabled$.subscribe((event) => {
          expect(event.url).to.equal(myTDD);
          done();
          //desmohub.stopListeners();
          subscription.unsubscribe();
        });
      });

      // retrieve tdd after enable

      it('should have a disabled tdd', function (done) {

        //desmohub.startListeners();
        desmohub.getTDD();
        const subscription: Subscription = desmohub.tddRetrieval$.subscribe((event) => {
          expect(event.disabled).to.be.true;
          done();
          //desmohub.stopListeners();
          subscription.unsubscribe();
        });

      });
    });


    //enable

    describe('Enable', function () {
      it('should enable a tdd', function (done) {

        desmohub.enableTDD();
        const subscription: Subscription = desmohub.tddEnabled$.subscribe((event) => {
          expect(event.url).to.equal(myTDD);
          done();
          subscription.unsubscribe();

        });
      });
      // retrieve tdd after enable
      it('should have an enabled tdd', function (done) {

        desmohub.getTDD();
        const subscription: Subscription = desmohub.tddRetrieval$.subscribe((event) => {
          expect(event.disabled).to.be.false;
          done();
          subscription.unsubscribe();

        });
      });

    });
  });


  after(function () {
    resetSandbox();
  });

});


