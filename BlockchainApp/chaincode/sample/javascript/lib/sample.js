/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const { Contract } = require('fabric-contract-api');

class Sample extends Contract {
    
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    async saveData(ctx, key, data) {
        console.info('============= START : saveData ===========');
        await ctx.stub.putState(key, Buffer.from(data));
        console.info('============= END : saveData ===========');
    }

    async detectPerson(ctx, key, data) {
        console.info('============= START : detectPerson ===========');
        await ctx.stub.putState(key, Buffer.from(data));
        console.info('============= END : detectPerson ===========');
    }
}

module.exports = Sample;
