import * as express from "express";
import cardRoute from "./routes/cardsRoute";

export const app = express()

app.set('json spaces', 2);
app.use("/cards", cardRoute)
