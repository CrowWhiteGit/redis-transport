
const Connection = require('../connect/redis');
const { TOPICS, REQUEST_TYPES } = require('./constansts');
const { v1: uuid } = require('uuid');

class Transport {
    /**@type {Connection} */
    #connection = null;
    #requests = {};
    #serviceName = null;
    #endpoints = {};
    interface = {};
    #debug = true;
    /**
     * 
     * @param {Connection} connection
     * @param {TOPICS} serviceName 
     * @param {{}} endpoints 
     */
    constructor(connection, endpoints, presets, config) {
        if (!connection) {
            throw new Error('Pass an instance of Connection');
        }
        if (!endpoints) {
            throw new Error('Incoming requests have to be specified');
        }
        if (!presets) {
            throw new Error('Outgoing requests have to be specified');
        }

        this.#connection = connection;
        this.#serviceName = config.nodeName;
        this.#debug = config.debug;
        this.#endpoints = endpoints;

        Object.keys(presets).forEach(key => {
            presets[key] = presets[key].bind(this);
            // this.interface[key] = presets[key].bind(this);
        })

        let sub = this.#connection.getSubscriber();

        sub.subscribe(TOPICS.GENERAL);
        sub.subscribe(this.#serviceName);

        sub.on('message', this.#handleMessage);

        if (this.#debug) console.log('Service name:', this.#serviceName);
    }

    notify = async (channel, cmd, payload = {}) => {
        let msg = {
            sender: this.#serviceName,
            type: REQUEST_TYPES.NOTIFY,
            cmd, payload
        };

        let numsub = await this.#connection.numSub(channel);
        if (numsub[1] == 0) {
            throw new Error(`Target channel ${channel} is not active`);
        }

        this.#connection.getPublisher().publish(channel, JSON.stringify(msg));
    };
    request = async (channel, cmd, payload = {}, cb) => {
        let reqId = uuid();

        let msg = {
            id: reqId,
            sender: this.#serviceName,
            type: REQUEST_TYPES.REQUEST,
            cmd, payload
        };

        this.#requests[reqId] = cb;

        if (this.#debug) console.log(`Channel: ${channel}\nCommand: ${cmd}\nRequest id: ${reqId}`);

        let numsub = await this.#connection.numSub(channel);
        if (numsub[1] == 0) {
            throw new Error(`Target channel ${channel} is not active`);
        }

        this.#connection.getPublisher().publish(channel, JSON.stringify(msg));
    };
    #response = async (channel, id, payload) => {
        let msg = {
            type: REQUEST_TYPES.RESPONSE,
            id, payload
        };

        this.#connection.getPublisher().publish(channel, JSON.stringify(msg));
    };
    #reply = async (channel, id, payload) => {
        let msg = {
            type: REQUEST_TYPES.REPLY,
            id, payload
        };

        this.#connection.getPublisher().publish(channel, JSON.stringify(msg));
    };

    #handleMessage = async (channel, message) => {
        const { id = null, sender = null, type = REQUEST_TYPES.NOTIFY, cmd = null, payload = {} } = JSON.parse(message);

        if (this.#debug) console.log(`Got message ${sender} ${type}, ${cmd}`)

        if (this.#debug) {
            console.log(type, 'request');
        }

        switch (type) {
            case REQUEST_TYPES.NOTIFY: {
                let req = { cmd, payload };
                await this.#handleNotify(cmd, req);
                break;
            }
            case REQUEST_TYPES.REQUEST: {
                let req = { cmd, payload };
                await this.#handleRequest(id, sender, cmd, req);
                break;
            }
            case REQUEST_TYPES.RESPONSE: {
                await this.#handleResponse(id, payload);
                break;
            }
            case REQUEST_TYPES.REPLY: {
                await this.#handleReply(id, payload);
                break;
            }
        }
    }

    #handleNotify = async (cmd, req) => {
        if (this.#endpoints[cmd]) {
            this.#endpoints[cmd].call(null, req);
        }
    }
    #handleRequest = async (id, sender, cmd, req) => {
        req.extra = {
            id, sender, cmd
        };

        let res = {
            reply: async (data) => {
                this.#reply.call(this, sender, id, data);
            },
            response: async (data) => {
                this.#response.call(this, sender, id, data);
            }
        };

        if (this.#endpoints[cmd]) {
            this.#endpoints[cmd].call(null, req, res);
        }
    }
    #handleResponse = async (id, payload) => {
        if (this.#requests[id]) {
            this.#requests[id].call(null, payload);
            delete this.#requests[id];
        }
    }
    #handleReply = async (id, payload) => {
        if (this.#requests[id]) this.#requests[id].call(null, payload);
    }
}

module.exports = Transport;