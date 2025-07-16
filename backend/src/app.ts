import express from "express";
import morgan from "morgan";

import authRoute from "./routes/authRoute";
import usersRoute from "./routes/usersRoute";
import profileRoute from "./routes/profileRoute"
import jobRoute from "./routes/JobRoute"
import resumeRoute from "./routes/resumeRoute"





const app = express();

app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/profile", profileRoute);
app.use("/api/job-description", jobRoute);
app.use("/api/resumes", resumeRoute);

export default app;