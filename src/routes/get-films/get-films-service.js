const Router = require('express-promise-router');
const router = new Router();
const rp = require('request-promise');

module.exports = router;

router.get("/", (req, res) => {
    rp.get(`${process.env.MOVIE_DB_API_URL}search/movie?api_key=${process.env.MOVIE_DB_API_KEY}&query=${req.query.q}`)
        .then((movieDbFilmsList) => {
            const resultList = JSON.parse(movieDbFilmsList).results.map((film) =>
                ({
                    id: film.id,
                    label: film.title
                }))
            res.json(resultList)
        });
});

router.get("/:filmId", (req, res) => {
    const filmId = req.params.filmId;

    if (isNaN(filmId)) {
        res.status(400).json({ error: { status: 400, message: "Id must be a number" } })
    } else {
        rp.get(`${process.env.MOVIE_DB_API_URL}movie/${filmId}?api_key=${process.env.MOVIE_DB_API_KEY}&language=en-US`)
        .then((filmData) => {
            if(filmData.status_code !== 6) {
                const data = JSON.parse(filmData);
                const formattedData = {
                    name: data.title,
                    rating: data.vote_average,
                    amountOfRatings: data.vote_count,
                    runtime: data.runtime,
                    date: data.release_date,
                    summary: data.overview,
                    imdbTitle: data.imdb_id,
                    genres: data.genres.map((genre) => genre.name),
                    imgUrl: data.belongs_to_collection.poster_path,
                    film_api_key: filmData.id
                }
                res.json(formattedData);
            } else {
                res.status(400).json({ error: { status: 400, message: `Film with id ${filmId} not found`  } });
            }
        });
    }
});

router.get("/ping", async (req, res) => {
    res.send("pong " + req.userId);
});
