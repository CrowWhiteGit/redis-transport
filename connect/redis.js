
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class Connection {
    /** @private */
    publisher = null;

    /** @private */
    subscriber = null;

    // /** @private */
    // port = 6379;
    // /** @private */
    // host = "127.0.0.1";
    // /** @private */
    // options = {};

    constructor(port = 6379, host = "127.0.0.1", options = {}) {
        this.publisher = redis.createClient(port, host, options);
        this.subscriber = redis.createClient(port, host, options);

        this.publisher.on('error', (err) => {
            console.log(err);
        });
        this.subscriber.on('error', (err) => {
            console.log(err);
        });
    }

    getPublisher = () => {
        return this.publisher;
    }

    getSubscriber = () => {
        return this.subscriber;
    }
}

module.exports = Connection;
