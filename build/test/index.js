"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const __1 = require("..");
const walletSigner_module_1 = require("./../lib/walletSigner-module");
const mocha_1 = require("mocha");
const sandboxRoot = './sandbox';
const samplesRoot = './samples';
const infuraURL = ''; // Replace with your own Infura URL
const privateKEY = "0xd01bb8eb696603a88d7c8fdc54e49ea4c66ac1ebcc6f41a7a910d72f9d8b3840"; // Replace with your own private key
const MYTDD = ''; // Replace with your own TDD for tests
const rpcUrl = "https://viviani.iex.ec";
/**
 * Clone any files in a "./samples" folder into
 * a "./sandbox" folder, overwriting any files
 * currently in there. This is useful for allowing
 * your test suite to make changes to files without
 * changing the originals, so that you can easily
 * reset back to an original state prior to running a test.
 */
function resetSandbox() {
    if (!fs_extra_1.default.existsSync(samplesRoot)) {
        // Then no samples exist, and no sandbox needed
        return;
    }
    fs_extra_1.default.ensureDirSync(sandboxRoot);
    fs_extra_1.default.emptyDirSync(sandboxRoot);
    fs_extra_1.default.copySync(samplesRoot, sandboxRoot);
}
(0, mocha_1.describe)('Test Suite', function () {
    before(function () {
        resetSandbox();
    });
    /***TESTS FOR THE DESMO-HUB***/
    // describe('DesmoHub Tests', function () {
    //   const walletSigner: WalletSigner = new WalletSigner(infuraURL);
    //   walletSigner.signInWithPrivateKey(privateKEY); //rembember to delete if you push to github
    //
    //   const desmohub: DesmoHub = new DesmoHub(walletSigner);
    //   const myTDD = MYTDD;
    //
    //   //start all listeners
    //   desmohub.startListeners();
    //
    //   describe('Retrieve', function () {
    //     it('should retrieve a tdd', async () => {
    //       const subscription: Subscription = desmohub.tddRetrieval$.subscribe(
    //         (event) => {
    //           expect(event.url).to.equal(myTDD);
    //           //desmohub.stopListeners();
    //           subscription.unsubscribe();
    //         },
    //       );
    //       await desmohub.getTDD();
    //     });
    //   });
    //
    //   // disable
    //   describe('Disable', function () {
    //     it('should disable a tdd', async () => {
    //       //desmohub.startListeners();
    //       const subscription: Subscription = desmohub.tddDisabled$.subscribe(
    //         (event) => {
    //           expect(event.url).to.equal(myTDD);
    //           //desmohub.stopListeners();
    //           subscription.unsubscribe();
    //         },
    //       );
    //       await desmohub.disableTDD();
    //     });
    //
    //     // retrieve tdd after enable
    //     it('should have a disabled tdd', async () => {
    //       //desmohub.startListeners();
    //       const subscription: Subscription = desmohub.tddRetrieval$.subscribe(
    //         (event) => {
    //           expect(event.disabled).to.be.true;
    //           //desmohub.stopListeners();
    //           subscription.unsubscribe();
    //         },
    //       );
    //       await desmohub.getTDD();
    //     });
    //   });
    //
    //   //enable
    //   describe('Enable', function () {
    //     it('should enable a tdd', async () => {
    //       const subscription: Subscription = desmohub.tddEnabled$.subscribe(
    //         (event) => {
    //           expect(event.url).to.equal(myTDD);
    //           subscription.unsubscribe();
    //         },
    //       );
    //       await desmohub.enableTDD();
    //     });
    //
    //     // retrieve tdd after enable
    //     it('should have an enabled tdd', async () => {
    //       const subscription: Subscription = desmohub.tddRetrieval$.subscribe(
    //         (event) => {
    //           expect(event.disabled).to.be.false;
    //           subscription.unsubscribe();
    //         },
    //       );
    //       await desmohub.getTDD();
    //     });
    //   });
    // });
    (0, mocha_1.describe)('DESMO COntract Tests', function () {
        const walletSigner = new walletSigner_module_1.WalletSigner(infuraURL);
        walletSigner.signInWithPrivateKey(privateKEY); //rembember to delete if you push to github
        const buyer = new __1.DesmoContract(walletSigner, rpcUrl, privateKEY);
        (0, mocha_1.describe)('Query buy process', function () {
            it('should buy query', async () => {
                await buyer.buyQuery("test");
            });
            it('should retrieve result from chain', async () => {
                await buyer.buyQuery("test");
                let resault = "";
                await buyer.getQueryResult().then(result => {
                    console.log(result);
                });
                setTimeout(async () => {
                }, 200000);
            });
        });
    });
    after(function () {
        resetSandbox();
    });
});
//# sourceMappingURL=index.js.map