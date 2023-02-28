const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const session = require("express-session");
require("./swagger")(app);
app.use(
  session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

require("./routes/authRoutes.js")(app);
require("./routes/userRoutes.js")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
