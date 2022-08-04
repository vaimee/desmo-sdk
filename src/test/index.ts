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

import 'mocha';

function importTest(name: string, path: string) {
  describe(name, function () {
    require(path);
  });
}

describe('Test Suite', function () {
  beforeEach((done) => setTimeout(done, 20000));

  importTest('DesmoHub Tests', './desmoHub-test');
  importTest('DesmoContract Tests', './desmoContract-test');

});
