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
            r.film_details.film_api_id = r.film_api_id;
            r.film_details.imgUrl = r.film_details.photoUrl;
            r.film_details.id = r.id;
            r.film_details.name = r.film_name;
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
    const { data, film_api_id, watchByDate, filmName } = body;
    console.log("add film ", userId, "     ", req);
    const filmExists = false;
    // const filmExists = await doesFilmExists(film_api_id, name);

    if (filmExists) {
        console.log("the film exists ", film_api_id, " name ", filmName);
        res.status(400).send({ error: { status: 400, message: "Film Exists" } })
    } else {
        const client = await db.client();
        try {
            for (let i = 0; i < 100; i++) {
                const filmId = uuidv4();
                await db.query(`insert into films(id, film_details, watch_by, user_id, film_api_id, film_name) 
                             values($1, $2, $3, $4, $5, $6)`, [filmId, data, new Date(watchByDate), userId, film_api_id, `filmName - ${i}`]);
            }
            res.send(filmId);
        } catch (e) {
            console.log("error logging in ", e)
            res.send({ status: 500, message: `Something went wrong at our end.` })
        } finally {
            client.release();
        }
    }
});

router.put("/updateFilm", async (req, res) => {
    const { userId, body } = req;
    const { data, watchByDate, id } = body;
    const filmExists = false;
    // const filmExists = await doesFilmExists(film_api_id, name);
    console.log("the film id ", id, " the user id ", userId);
    const client = await db.client();
    try {
        const { rowCount } = await db.query(`update films set film_details = $1, watch_by = $2 where id = $3 and user_id = $4`, [data, new Date(watchByDate), id, userId]);
        res.send(rowCount);
    } catch (e) {
        console.log("error logging in ", e)
        res.send({ status: 500, message: `Something went wrong at our end.` })
    } finally {
        client.release();
    }
});
