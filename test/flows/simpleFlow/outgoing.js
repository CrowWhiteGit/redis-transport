
const { REQUEST_TYPES, Transport } = require('../../../index');

/**
 * @this Transport
 */
function testSync(foo, cb) {
    let _payload = { foo };
    this.request('node2', 'HELLO', _payload, cb);
}

function testAsync(foo) {
    return new Promise(resolve => {
        let _payload = { foo };
        this.request('node2', 'HELLO', _payload, (result) => {
            resolve(result);
        });
    })
}

module.exports = { testSync, testAsync }

