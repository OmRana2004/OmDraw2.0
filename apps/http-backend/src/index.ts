import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/pageRoutes";

const app = express();

app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

app.use("/api/v1", routes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});