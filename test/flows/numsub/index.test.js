
const { expect, test } = require('@jest/globals');

const Connection = require('../../../connect/redis');

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

const _connection = new Connection(_config1.connection.port, _config1.connection.host, _config1.connection.options);


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

test('numsub', async () => {
    let result = await _connection.numSub('qwe');
    expect(result.length).toBe(2);
    // expect(result[1]).toBe(1);
})

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
