
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
    constructor(connection, serviceName, endpoints, presets) {
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
        this.#serviceName = serviceName;
        this.#endpoints = endpoints;

        Object.keys(presets).forEach(key => {
            this.interface[key] = presets[key].bind(this);
        })

        this.#connection.getSubscriber().subscribe(TOPICS.GENERAL);
        this.#connection.getSubscriber().subscribe(this.#serviceName);

        this.#connection.getSubscriber().on('message', this.#handleMessage);
    }

    notify = async (channel, cmd, payload = {}) => {
        let msg = {
            sender: this.#serviceName,
            type: REQUEST_TYPES.NOTIFY,
            cmd, payload
        };
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

        if (this.#debug) {
            console.log(type, 'request');
        }

        switch (type) {
            case REQUEST_TYPES.NOTIFY: {
                await this.#handleNotify(cmd, payload);
                break;
            }
            case REQUEST_TYPES.REQUEST: {
                await this.#handleRequest(id, sender, cmd, payload);
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

    #handleNotify = async (cmd, payload) => {
        if (this.#endpoints[cmd]) {
            this.#endpoints[cmd].call(null, payload);
        }
    }
    #handleRequest = async (id, sender, cmd, payload) => {
        let _reply = async (data) => {
            this.#reply.call(this, sender, id, data);
        };
        let _response = async (data) => {
            this.#response.call(this, sender, id, data);
        };
        let _extra = {
            id, sender, cmd
        };

        if (this.#endpoints[cmd]) {
            this.#endpoints[cmd].call(null, _reply, _response, payload, _extra);
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