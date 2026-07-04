import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import documentRoutes from "./modules/documents/document.routes.js";
import {authenticate} from "./middleware/auth.middleware.js";

const app= express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("InkFlow backend is running!");
}); 

app.get("/protected", authenticate, (req, res) => {
        res.json({
            message: "Welcome!",
        });
    }
);

app.use("/api/documents", documentRoutes);
app.use("/api/auth", authRoutes);

export default app;