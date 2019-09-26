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
        const { rows } = await db.query(`select * from films where user_id = $1 order by watch_by asc`, [userId]);
        console.log("rows ", JSON.stringify(rows))
        const result = rows.map((r) => {
            r.film_details.watchByDate = r.watch_by;
            r.film_details.filmApiId = r.film_api_id;
            r.film_details.imgUrl = r.film_details.photoUrl
            r.film_details.id = r.id
            return r.film_details;
        })
        res.send(result);
    } catch (e) {
        console.log("error logging in ", e)
        res.send({ status: 500, message: `Something went wrong at our end.` })
    } finally {
        client.release();
    }
});

router.post("/addFilm", async (req, res) => {
    const { userId, body } = req;
    const { data, film_api_id, watchByDate } = body;
    const filmExists = false;
    // const filmExists = await doesFilmExists(film_api_id, name);
    
    if (filmExists) {
        console.log("the film exists ", film_api_id, " name ", name);
        res.status(400).send({ error: { status: 400, message: "Film Exists" } })
    } else {
        const client = await db.client();
        try {
            const filmId = uuidv4();
            // await db.query(`insert into media_content(id, name, media_type, media_information, user_id, film_api_id) 
            //                 values($1, $2, $3, $4, $5, $6)`, [filmId, name, 'FILM', data, userId, film_api_id]);
            await db.query(`insert into films(id, film_details, watch_by, user_id, film_api_id) 
                             values($1, $2, $3, $4, $5)`, [filmId, data, new Date(watchByDate), userId, film_api_id]);
            res.send(filmId);
        } catch (e) {
            console.log("error logging in ", e)
            res.send({ status: 500, message: `Something went wrong at our end.` })
        } finally {
            client.release();
        }
    }

});
