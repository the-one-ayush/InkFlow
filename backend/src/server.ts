import app from "./app.js";
import {createServer} from "http";
import {initializeSocket} from "./socket/index.js";

const PORT= process.env.PORT || 5000;

const server= createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
    console.log(`InkFlow backend running on port ${PORT}`);
});