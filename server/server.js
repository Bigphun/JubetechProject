const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//routes
readdirSync("./routes").map((r) => app.use("/api", require("./routes/" + r)));

//database
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("database connected successfully"))
  .catch((err) => console.log("error connecting to mongodb", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server is running on port http://localhost:${PORT}/api`);
});
