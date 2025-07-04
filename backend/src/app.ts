import express from "express";
import morgan from "morgan";

import authRoute from "./routes/authRoute";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoute);


export default app;