const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const port = process.env.PORT;
const mountRoutes = require("./routes/index");
const VerifyToken = require('./auth/verify-token');

const app = express();

app.use(cors());
app.use(VerifyToken);
app.use(bodyParser.json({ limit: "10mb" }));

mountRoutes(app);

app.listen(port, function () {
 console.log(`Example app listening on port ${port}!`);
});