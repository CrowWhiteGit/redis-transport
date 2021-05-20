
const { expect, test } = require('@jest/globals');
const transport = require('../../../index');

let incoming = require('./incoming');
let outgoing = require('./outgoing');

/**
 * Enum string values.
 * @readonly
 * @enum {number}
 */
const NODES = {
    FIRST: 'node1',
    SECOND: 'node2'
};

const _config1 = {
    connection: {
        host: "127.0.0.1",
        port: 6379,
        options: {}
    },
    transport: {
        nodeName: NODES.FIRST,
        debug: false
    }
};

const _config2 = {
    connection: {
        host: "127.0.0.1",
        port: 6379,
        options: {}
    },
    transport: {
        nodeName: NODES.SECOND,
        debug: false
    }
}


async function simpleFlow() {
    let _t1 = transport.createTransport(_config1, {}, outgoing);
    let _t2 = transport.createTransport(_config2, incoming, {});

    await sleep(1000);

    let foo = "bar";

    let result = await outgoing.testAsync(foo);

    _t1 = null;
    _t2 = null;

    return result;
};

test('Simple flow', async () => {
    let result = await simpleFlow();
    console.log('result?', result)
    expect(result).toBe("Hello, bar");
})

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
