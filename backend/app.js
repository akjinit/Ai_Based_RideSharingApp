const express = require("express");
const app = express();
const cors = require("cors");
const connectToDb = require("./db/db");
const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require('./routes/map.routes');
const ridesRoutes = require('./routes/rides.routes');
const cookieParser = require("cookie-parser");
connectToDb();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/captains", captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides',ridesRoutes);
const mapController = require('./controllers/map.controller');
//gdg



app.get("/", (req, res) => {
  res.send("You have tried modifying the route. ");
});


module.exports = app;
