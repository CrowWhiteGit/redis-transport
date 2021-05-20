
const Transport = require('./src/Transport');
const { TOPICS, REQUEST_TYPES } = require('./src/constansts');
const Connection = require('./connect/redis');

const _config = {
    connection: {
        host: "127.0.0.1",
        port: 6379,
        options: {}
    },
    nodeName: TOPICS.GENERAL
}

let _connection = null;
let _transport = null;

async function createTransport(config = _config, incoming, outgoing) {
    _connection = new Connection(config.connection.port, config.connection.host, config.connection.options);
    _transport = new Transport(_connection, _config.nodeName, incoming, outgoing);
}

module.exports = {
    createTransport
};