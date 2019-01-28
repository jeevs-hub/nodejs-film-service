const Router = require('express-promise-router');
const router = new Router();
const rp = require('request-promise');

module.exports = router;

router.get("/search", (req, res) => {
    rp.get(`${process.env.MOVIE_DB_API_URL}search/movie?api_key=${process.env.MOVIE_DB_API_KEY}&query=${req.query.q}`)
        .then((movieDbFilmsList) => {
            const resultList = JSON.parse(movieDbFilmsList).results.map((film) =>
                ({
                    id: film.id,
                    title: film.title,
                    year: film.release_date
                }))
            res.json(resultList)
        });
});

router.get("/ping", async (req, res) => {
    res.send("pong " + req.userId);
});
