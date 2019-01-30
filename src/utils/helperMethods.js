const db = require("./db.js");

module.exports.doesFilmExists = async (filmApiId, name) => {
    const client = await db.client();
    try {
        const { rows } = await db.query(`select * from media_content where film_api_id = $1 and name = $2`, [filmApiId, name]);
        return rows.length > 0;
    } catch (e) {
        console.log("error checking if film exists", e);
        throw { status: 500, message: `Something went wrong at our end.` };
    } finally {
        client.release();
    }
}