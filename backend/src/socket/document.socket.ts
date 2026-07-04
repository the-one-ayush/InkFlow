interface DocumentChangeData {
    documentId: string;
    content: object;
}

interface OnlineUser {
    id: string;
    name: string;
    email: string;
    socketId: string;
}

export const onlineUsers = new Map<string, OnlineUser[]>();

import type {Server, Socket} from "socket.io";

export const registerDocumentEvents= (io: Server, socket: Socket) => {
    socket.on("join-document", (
            data: {
                documentId: string;
                user: {
                    id: string;
                    name: string;
                    email: string;
                };
            }
        ) => {
            socket.join(data.documentId);

            const users= onlineUsers.get(data.documentId) ?? [];
            const exists= users.find((user) => user.id===data.user.id);

            if (!exists) {
                users.push({...data.user, socketId: socket.id,});
            }

            onlineUsers.set(data.documentId, users);

            io.to(data.documentId).emit("online-users", users);
        }
    );

    socket.on("leave-document", (documentId: string) => {

            socket.leave(documentId);

            const users= onlineUsers.get(documentId) ?? [];
            const updated = users.filter( (user) => user.socketId !== socket.id);

            onlineUsers.set(documentId, updated);

            io.to(documentId).emit("online-users", updated);
        }
    );


    socket.on("send-changes", (data: DocumentChangeData) => {
            io.to(data.documentId).emit("receive-changes", data.content);
        }
    );

    socket.on("title-change", (data: {documentId: string; title: string;}) => {
            socket.to(data.documentId).emit("receive-title", data.title);
        }
    );
};