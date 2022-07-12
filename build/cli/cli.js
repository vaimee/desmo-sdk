#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
// Kick it off
commander_1.default.description('CLI Name')
    .command("subcommand", "Do some things.")
    .parse();
//# sourceMappingURL=cli.js.map