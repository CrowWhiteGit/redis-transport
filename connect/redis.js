
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

        options.retry_strategy = retryStrategy;

        this.publisher = redis.createClient(port, host, options);
        this.subscriber = redis.createClient(port, host, options);

        this.publisher.on('error', (err) => {
            console.log(err);
        });
        this.subscriber.on('error', (err) => {
            console.log(err);
        });

        this.getPublisher = this.getPublisher.bind(this);
        this.getSubscriber = this.getSubscriber.bind(this);
        this.numSub = this.numSub.bind(this);
        // this.authenticate = this.authenticate.bind(this);
        // this.authorize = this.authorize.bind(this);
    }

    /**
     * @returns {redis.RedisClient}
     */
    getPublisher() {
        return this.publisher;
    }

    /**
    * @returns {redis.RedisClient}
    */
    getSubscriber() {
        return this.subscriber;
    }

    // /**
    //  * @private
    //  * @param {redis.RedisClient} clientRef 
    //  */
    // handleError(clientRef) {
    //     clientRef.quit();
    // }

    // async authenticate(id, session) {
    //     this.publisher.setAsync(`nodes:${id}`, session);
    // }

    // async authorize(id) {
    //     if (!id) return {};
    //     const session = await this.publisher.getAsync(`nodes:${id}`);
    //     return session ? JSON.parse(session) : {};
    // }

    numSub(topic) {
        return new Promise((resolve, reject) => {
            this.publisher.pubsub('NUMSUB', topic, function (err, result) {
                if (err) reject(err);
                resolve(result);
            });
        })
    }
}

function retryStrategy(options) {
    // if (options.attempt > 10) {
    //     return undefined;
    // }
    // console.log(`[${(new Date()).toUTCString()}] Reconnecting, ${options.attempt} attempt...`);
    return Math.min(options.attempt * 100, 3000);
};

module.exports = Connection;
