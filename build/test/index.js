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
const sandboxRoot = "./sandbox";
const samplesRoot = "./samples";
const desmoContract_module_1 = require("build/lib/desmoContract-module");
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
describe("Test Suite", function () {
    before(function () {
        resetSandbox();
    });
    describe("Test Group", function () {
        // it("can do something", function () {
        //   resetSandbox();
        //   expect(false).to.be.true;
        // });
        it("Should buy computation on iExec", function () {
            const buyer = new desmoContract_module_1.DesmoContractIexec("154", "");
        });
    });
    after(function () {
        resetSandbox();
    });
});
//# sourceMappingURL=index.js.map