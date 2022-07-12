#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
// Kick it off
commander_1.default
    .description('CLI Name: Subcommand')
    .requiredOption('-r --required <info>', 'Some required info')
    .option('-o --optional <data>', 'Optional info', 'default value')
    .option('--flag', 'A boolean flag.')
    .parse();
// Sample user options available via:
const options = commander_1.default.opts();
options.optional;
options.required;
options.flag; // false if not provided by the user, else true
//# sourceMappingURL=cli-subcommand.js.map