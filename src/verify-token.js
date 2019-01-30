const rp = require('request-promise');

verifyToken = (req, res, next) => {
    var token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: 'Authorisation not provided.' });
    rp(getOptions(token)).then((res) => {
        req.userId = res.id;
        next();
    })
    .catch((err) => res.status(403).send({ message: 'Error validating token' }))
}

const getOptions = (token) => {
    return {
        method: 'POST',
        uri: `${process.env.AUTH_URL}validateAuth`,
        body: { token },
        headers: {
            'x-api-key': process.env.AUTH_API_KEY
        },
        json: true
    };
}
module.exports = verifyToken;
