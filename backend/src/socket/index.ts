import {Server} from "socket.io";
import type {Server as HttpServer} from "http";
import {registerDocumentEvents, onlineUsers,} from "./document.socket.js";

export const initializeSocket= (server: HttpServer) => {
    const io= new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        registerDocumentEvents(io, socket);

        socket.on("disconnect", () => {
            for (const [documentId, users,] of onlineUsers.entries()) {

                const updatedUsers = users.filter((user) => user.socketId !== socket.id);

                if (updatedUsers.length!==users.length) {
                    onlineUsers.set(documentId, updatedUsers);

                    io.to(documentId).emit("online-users", updatedUsers);
                }
            }
        });
    });
    return io;
};