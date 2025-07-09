import express from "express";
import morgan from "morgan";

import authRoute from "./routes/authRoute";
import resumeRoute from "./routes/resumeRoute";
import usersRoute from "./routes/usersRoute";
import jobRoute from "./routes/jobRoute";


const app = express();

app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoute);
app.use("/api/resume", resumeRoute);
app.use("/api/users", usersRoute);
app.use("/api/job", jobRoute);

export default app;