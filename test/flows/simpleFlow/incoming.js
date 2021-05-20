

function HELLO(payload, reply, response, extra = {}) {
    let { foo } = payload;
    response(`Hello, ${foo}`);
}


module.exports = { HELLO }
