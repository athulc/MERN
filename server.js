const express = require("express");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

//Connect Database
connectDB();

//Initialize body-parser (Middleware)
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("API is running!");
});

//Define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
