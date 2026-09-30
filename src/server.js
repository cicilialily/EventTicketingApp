// require("dotenv").config();

// const app = require("./app");

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`EventTicketing API running on port ${PORT}`);
// }); 

import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`EventTicketing API running on port ${PORT}`);
});