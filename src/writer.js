/* @flow */

const Transform = require('stream').Transform;

const Token = require('./token');

class Writer extends Transform {
  version: 0x07000000 | 0x07010000 | 0x71000001 | 0x72090002 | 0x730A0003 | 0x730B0003 | 0x74000004

  constructor(version: 0x07000000 | 0x07010000 | 0x71000001 | 0x72090002 | 0x730A0003 | 0x730B0003 | 0x74000004) {
    super({ writableObjectMode: true });

    this.version = version;
  }

  _transform(chunk: Token | Buffer | string, encoding: string | null, callback: () => void) {
    if (!(chunk instanceof Token)) {
      return process.nextTick(callback, new Error('Expected Buffer'));
    }

    const token: Token = chunk;

    try {
      switch (token.id) {
        case 0xFD:
          writeDoneToken(this, token);
          break;

        case 0xAA:
          writeErrorToken(this, token);
          break;

        case 0xAB:
          writeInfoToken(this, token);
          break;

        case 0x79:
          writeReturnStatusToken(this, token);
          break;
      }
    } catch (e) {
      return process.nextTick(callback, e);
    }

    process.nextTick(callback);
  }
}

module.exports = Writer;

const writeDoneToken = require('./tokens/done/write');
const writeErrorToken = require('./tokens/error/write');
const writeInfoToken = require('./tokens/info/write');
const writeReturnStatusToken = require('./tokens/return-status/write');
