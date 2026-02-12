#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as path from 'path';
import type {AddressInfo} from 'net';

import express from 'express';

import {logger} from '../common/util/logger';

import {parseIfVizArgs} from './util/args';

import {CONFIG, STRINGS} from './config';

const {VIZ_URL} = CONFIG;
const {SERVER_STARTED, SERVER_START_FAILED, OPENING_BROWSER, STOP_MESSAGE} =
  STRINGS;

const IfViz = async () => {
  const {manifest, port, noOpen} = await parseIfVizArgs();

  const directory = path.dirname(manifest);
  const filename = path.basename(manifest);

  const app = express();

  // Enable CORS for all origins so the viz app can fetch the manifest.
  app.use((_req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // Serve the manifest's directory as static files.
  app.use(express.static(directory));

  const server = app.listen(port, () => {
    const addr = server.address() as AddressInfo;
    const serverUrl = `http://localhost:${addr.port}`;

    logger.info(SERVER_STARTED(serverUrl));
    logger.info(STOP_MESSAGE);

    if (!noOpen) {
      const fileUrl = `${serverUrl}/${filename}`;
      const vizUrl = `${VIZ_URL}/?url=${encodeURIComponent(fileUrl)}`;
      logger.info(OPENING_BROWSER(vizUrl));

      import('open').then(({default: open}) => open(vizUrl));
    }
  });

  server.on('error', (err: Error) => {
    logger.error(SERVER_START_FAILED(err));
    process.exit(2);
  });

  const handler = (signal: NodeJS.Signals) => {
    logger.debug(`${signal} signal received: closing server`);
    server.close(() => {
      logger.debug('Server closed');
    });
  };
  process.once('SIGTERM', handler);
  process.once('SIGINT', handler);
};

IfViz().catch(err => {
  if (err instanceof Error) {
    logger.error(err);
    process.exit(2);
  }
});
