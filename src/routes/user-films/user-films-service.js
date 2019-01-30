const Router = require('express-promise-router');
const router = new Router();
const db = require("../../utils/db.js");
const uuidv4 = require('uuid/v4');
const { doesFilmExists } = require("../../utils/helperMethods.js");

module.exports = router;

router.get("/", async (req, res) => {
    const { userId } = req;
    const client = await db.client();
    try {
        const rows = await db.query(`select * from media_content`, []);
        res.send(rows);
    } catch (e) {
        console.log("error logging in ", e)
        res.send({ status: 500, message: `Something went wrong at our end.` })
    } finally {
        client.release();
    }
});

router.post("/addFilm", async (req, res) => {
    const { userId, body } = req;
    const { name, data, film_api_id } = body;
    const filmExists = await doesFilmExists(film_api_id, name);

    if (filmExists) {
        console.log("the film exists ", film_api_id, " name ", name);
        res.status(400).send({ error: { status: 400, message: "Film Exists" } })
    } else {
        const client = await db.client();
        try {
            const filmId = uuidv4();
            await db.query(`insert into media_content(id, name, media_type, media_information, user_id, film_api_id) 
                            values($1, $2, $3, $4, $5, $6)`, [filmId, name, 'FILM', data, userId, film_api_id]);
            res.send(filmId);
        } catch (e) {
            console.log("error logging in ", e)
            res.send({ status: 500, message: `Something went wrong at our end.` })
        } finally {
            client.release();
        }
    }

});
