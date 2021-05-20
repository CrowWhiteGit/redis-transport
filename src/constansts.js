
/**
 * Enum int values.
 * @readonly
 * @enum {number}
 */
const REQUEST_TYPES = {
    NOTIFY: 0,
    REQUEST: 1,
    RESPONSE: 2,
    REPLY: 3
};

/**
 * Enum string values.
 * @readonly
 * @enum {number}
 */
 const TOPICS = {
    GENERAL: 'general',
    PERIPHERY: 'periphery',
    KEYSTORE: 'keyStore',
    TESTDRIVE: 'testDrive'
};

module.exports = { TOPICS, REQUEST_TYPES };