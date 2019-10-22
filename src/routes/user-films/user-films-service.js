const Router = require('express-promise-router');
const router = new Router();
const db = require("../../utils/db.js");
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
const { doesFilmExists } = require("../../utils/helperMethods.js");

module.exports = router;

// router.get("/:offset/:limit/:filter", async (req, res) => {
router.get("/", async (req, res) => {
    const { userId, query } = req;
    const { offset, limit, filter, order, orderAsc } = query;
    const client = await db.client();
    try {
        const filterQuery = `(select * from films where user_id = $1 and (film_name ilike '%' || $4 || '%') offset $2 limit $3) 
        order by ${getOrderBy(order)} ${orderAsc === 'true' ? 'asc' : 'desc'}`;
        const countQuery = `(select count (*) from films where user_id = $1 and film_name ilike '%' || $2 || '%')`;
        const filterReq = db.query(filterQuery, [userId, offset, limit, filter]);
        const countReq = db.query(countQuery, [userId, filter]);

        let [filterResult, countResult] = await Promise.all([filterReq, countReq]);
        const { rows } = filterResult;
        const result = rows.map((r) => {
            r.film_details.watchByDate = r.watch_by;
            r.film_details.film_api_id = r.film_api_id;
            r.film_details.imgUrl = r.film_details.photoUrl;
            r.film_details.id = r.id;
            r.film_details.name = r.film_name;
            r.film_details.date = new Date(r.release_date).toLocaleString();
            r.film_details.rating = r.rating;
            r.film_details.runtime = r.runtime;
            return r.film_details;
        })

        res.send({ data: result, count: countResult.rows[0].count });
    } catch (e) {
        console.log("error logging in ", e)
        res.status(500).send({ status: 500, message: `Something went wrong at our end.` })
    } finally {
        client.release();
    }
});

router.post("/addFilm", async (req, res) => {
    const { userId, body } = req;
    const { data, film_api_id, watchByDate, filmName, date, rating, runtime } = body;
    const filmExists = false;
    if (filmExists) {
        console.log("the film exists ", film_api_id, " name ", filmName);
        res.status(400).send({ error: { status: 400, message: "Film Exists" } })
    } else {
        const client = await db.client();
        try {
            const filmId = uuidv4();
            await db.query(`insert into films(id, film_details, watch_by, user_id, film_api_id, film_name, release_date, rating, runtime) 
                             values($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [filmId, data, new Date(watchByDate), userId, film_api_id, filmName, date, rating, runtime]);
            res.send(filmId);
        } catch (e) {
            console.log("error logging in ", e)
            res.status(500).send({ status: 500, message: `Something went wrong at our end.` })
        } finally {
            client.release();
        }
    }
});

router.put("/updateFilm", async (req, res) => {
    const { userId, body } = req;
    const { data, watchByDate, id } = body;
    const filmExists = false;
    console.log("the film id ", id, " the user id ", userId);
    const client = await db.client();
    try {
        const { rowCount } = await db.query(`update films set film_details = $1, watch_by = $2 where id = $3 and user_id = $4`, [data, new Date(watchByDate), id, userId]);
        res.send(rowCount);
    } catch (e) {
        console.log("error logging in ", e)
        res.status(500).send({ status: 500, message: `Something went wrong at our end.` })
    } finally {
        client.release();
    }
});

router.post("/addDummyData", async (req, res) => {
    const { userId } = req;
    const client = await db.client();
    try {            
            const pageNum = await getPageNum();
            rp.get(`${process.env.MOVIE_DB_API_URL}discover/movie?api_key=${process.env.MOVIE_DB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${pageNum}`)
                .then((x) => {
                    //get more information such as runtime
                        x = JSON.parse(x);
                        x.results.map(async (film) => {
                            rp.get(`${process.env.MOVIE_DB_API_URL}movie/${film.id}?api_key=${process.env.MOVIE_DB_API_KEY}&language=en-US`).then(async (y) => {
                                y = JSON.parse(y);
                                film.runtime = y.runtime;
                                const date = new Date();
                                date.setDate(date.getDate() + Math.floor((Math.random() * 100) + 1));
                                const formattedFilm = {
                                    "genres": film.genre_ids.map((x) => convertGenreToId(x)),
                                    "summary": film.overview,
                                    "photoUrl": film.poster_path ? film.poster_path : film.backdrop_path,
                                    "additionalNotes": "Test film"
                                };
                                const filmId = uuidv4();
                                await db.query(`insert into films(id, film_details, watch_by, user_id, film_api_id, film_name, release_date, rating, runtime) 
                                values($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                                    [filmId, formattedFilm, new Date(date), userId, film.id, film.title, new Date(film.release_date), film.vote_average, film.runtime]);    
                                
                                await db.query(`update users SET rand_film_added = rand_film_added || $1 where id = $2`, [pageNum, userId])
                            });
                        });
                });
        res.send("Films added ")
    } catch (e) {
        console.log("error adding dummy data ", e)
        res.status(500).send({ status: 500, message: `Something went wrong at our end.` })
    } finally {
        client.release();
    }
});

getOrderBy = (orderby) => {
    switch (orderby) {
        case 'name':
            return 'film_name';
        case 'runtime':
            return 'runtime';
        case 'releaseDate':
            return 'release_date';
        case 'watchByDate':
            return 'watch_by';
        case 'rating':
            return 'rating';
        default:
            return 'film_name';

    }
}
convertGenreToId = (genreId) => {
    return [
        {
            "id": 28,
            "name": "Action"
        },
        {
            "id": 12,
            "name": "Adventure"
        },
        {
            "id": 16,
            "name": "Animation"
        },
        {
            "id": 35,
            "name": "Comedy"
        },
        {
            "id": 80,
            "name": "Crime"
        },
        {
            "id": 99,
            "name": "Documentary"
        },
        {
            "id": 18,
            "name": "Drama"
        },
        {
            "id": 10751,
            "name": "Family"
        },
        {
            "id": 14,
            "name": "Fantasy"
        },
        {
            "id": 36,
            "name": "History"
        },
        {
            "id": 27,
            "name": "Horror"
        },
        {
            "id": 10402,
            "name": "Music"
        },
        {
            "id": 9648,
            "name": "Mystery"
        },
        {
            "id": 10749,
            "name": "Romance"
        },
        {
            "id": 878,
            "name": "Science Fiction"
        },
        {
            "id": 10770,
            "name": "TV Movie"
        },
        {
            "id": 53,
            "name": "Thriller"
        },
        {
            "id": 10752,
            "name": "War"
        },
        {
            "id": 37,
            "name": "Western"
        }
    ].find(x => x.id === genreId).name
}
getPageNum = async () => {
    let randNum;
    let foundRandNum = false;
    while(!foundRandNum) {
        randNum = Math.round(Math.random() * (500 - 1) + 1);
        const { rowCount } = await db.query(`select rand_film_added from users where id = '84d3542d-3b3e-4aa5-bbab-69829f248be4' and $1=ANY(rand_film_added)`, [randNum]);
        foundRandNum = rowCount === 0;
    }
    return randNum;
}