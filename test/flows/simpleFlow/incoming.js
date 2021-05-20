

function HELLO(reply, response, payload, extra = {}) {
    let { foo } = payload;
    response(`Hello, ${foo}`);
}


module.exports = { HELLO }
