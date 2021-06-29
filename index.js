
const Transport = require('./src/Transport');
const { TOPICS, REQUEST_TYPES } = require('./src/constansts');
const Connection = require('./connect/redis');

const _config = {
    connection: {
        host: "127.0.0.1",
        port: 6379,
        options: {}
    },
    transport: {
        nodeName: TOPICS.GENERAL,
        debug: false
    }
}

function createTransport(config = _config, incoming, outgoing) {
    const _connection = new Connection(config.connection.port, config.connection.host, config.connection.options);
    const _transport = new Transport(_connection, incoming, outgoing, config.transport);

    return _transport;
}

module.exports = {
    createTransport,
    Transport,
    REQUEST_TYPES
};