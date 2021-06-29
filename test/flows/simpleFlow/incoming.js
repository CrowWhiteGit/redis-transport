

function HELLO(req, res) {
    let { foo } = req.payload;
    res.response(`Hello, ${foo}`);
}


module.exports = { HELLO }
