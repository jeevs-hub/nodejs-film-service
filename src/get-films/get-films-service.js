const Router = require('express-promise-router');
const router = new Router();
const VerifyToken = require('../auth/verify-token');
const rp = require('request-promise');

module.exports = router;

router.get("/all", async (req, res) => {
    res.send("hello worldl")
    // const client = await db.client();
    // try {
    //     const { rows } = await db.query(`select * from users`);
    //     res.send(rows);
    // } catch (e) {
    //     console.log("error logging in ", (e))
    //     res.status(500).send("Internal Server Error");
    // } finally {
    //     client.release();
    // }
});

router.get("/ping", VerifyToken, async (req, res) => {
    res.send("pong " + req.userId);
});
