"use strict";
/** @file Typescript typing information
 * If you want to break your types out from your code, you can
 * place them into the 'types' folder. Note that if you using
 * the type declaration extention ('.d.ts') your files will not
 * be compiled -- if you need to deliver your types to consumers
 * of a published npm module use the '.ts' extension instead.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationType = void 0;
var OperationType;
(function (OperationType) {
    OperationType[OperationType["registerTDD"] = 0] = "registerTDD";
    OperationType[OperationType["disableTDD"] = 1] = "disableTDD";
    OperationType[OperationType["enableTDD"] = 2] = "enableTDD";
    OperationType[OperationType["retrieveTDD"] = 3] = "retrieveTDD";
})(OperationType = exports.OperationType || (exports.OperationType = {}));
//# sourceMappingURL=index.js.map