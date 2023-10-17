const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app");
const local_url = "mongodb://localhost:27017/DressIN";
const cluster_url =
  `process.env.MONGO_URL`;
const DB_URI = process.env.NODE_ENV === "production" ? cluster_url : local_url;
const PORT = 3000;

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MONGO DB CONNECTED ..."));

app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT} ...`));
