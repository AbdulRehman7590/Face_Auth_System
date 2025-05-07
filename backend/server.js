const app = require("./app");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(5000, () =>
      console.log("Backend running on http://localhost:5000")
    );
  })
  .catch((err) => console.error("DB connection failed:", err));
