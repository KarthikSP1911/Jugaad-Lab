#!/usr/bin/env node
import { runCli } from './cli.js';
import { createNodeIo } from './host-node.js';

process.exitCode = runCli(process.argv.slice(2), createNodeIo());
