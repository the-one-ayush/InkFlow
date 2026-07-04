"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import api from "@/lib/axios";
import socket from "@/lib/socket";

import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Toolbar from "@/components/Toolbar";
import Editor from "@/components/Editor";
import ShareDialog from "@/components/ShareDialog";

interface Doc {
    id: string;
    title: string;
    content: object;
}

interface CurrentUser {
    id: string;
    name: string;
    email: string;
}

export default function DocumentPage() {
    const params= useParams<{ id: string }>();
    const router= useRouter();
    const [docData, setDocData]= useState<Doc | null>(null);
    const [content, setContent]= useState<object>({});
    const [title, setTitle]= useState("");
    const [hasChanges, setHasChanges]= useState(false);
    const [saveStatus, setSaveStatus]= useState<"saved" | "saving">("saved");
    const [shareOpen, setShareOpen]= useState(false);
    const [canEdit, setCanEdit]= useState(false);
    const [currentUser, setCurrentUser]= useState<CurrentUser | null>(null);
    const [onlineUsers, setOnlineUsers]= useState<CurrentUser[]>([]);

    const editor = useEditor({
        extensions: [StarterKit],
        editable: canEdit,
        content,
        onUpdate: ({ editor }) => {
            if (!canEdit) return;

            const newContent = editor.getJSON();
            setContent(newContent);
            setHasChanges(true);
            setSaveStatus("saving");

            socket.emit("send-changes", {documentId: params.id, content: newContent,});
        },
    });

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(canEdit);
    }, [editor, canEdit]);

    const fetchDocument= async () => {
        try {
            const response= await api.get(`/documents/${params.id}`);

            setDocData(response.data.document);
            setTitle(response.data.document.title);
            setContent(response.data.document.content);
            setCanEdit(response.data.canEdit);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCurrentUser= async () => {
        try {
            const response= await api.get("/auth/me");
            setCurrentUser(response.data.user);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchDocument();
        fetchCurrentUser();
    }, []);

    const saveDocument= useCallback(async () => {
        if (!docData || !editor) return;

        try {
            await api.patch(`/documents/${docData.id}`, {title, content: editor.getJSON(),});
            setSaveStatus("saved");
        } catch (error) {
            console.error(error);
        }
    }, [docData, title, editor]);

    const handleDelete= async () => {
        if (!confirm("Delete this document?")) {
            return;
        }

        try {
            await api.delete(`/documents/${params.id}`);
            router.replace("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Failed to delete document");

        }
    };

    useEffect(() => {
        if (!canEdit) return;
        if (!hasChanges) return;

        const timer = setTimeout(() => {
             if (!editor) return;
            saveDocument();
            setHasChanges(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [canEdit, title, editor, hasChanges, saveDocument,]);

    

    useEffect(() => {
        if (!params.id) return;

        if (currentUser) {
            socket.emit("join-document", {documentId: params.id, user: currentUser,});
        }

        return () => {
            socket.emit("leave-document", params.id);
        };
    }, [params.id, currentUser]);

    useEffect(() => {
        const handleReceiveChanges= (newContent: object) => {
            setContent(newContent);
        };

        socket.on("receive-changes", handleReceiveChanges);

        return () => {
            socket.off("receive-changes", handleReceiveChanges);
        };
    }, []);

    useEffect(() => {
        if (!params.id) return;

        socket.emit("title-change", {documentId: params.id, title,});
    }, [title, params.id]);

    useEffect(() => {
        const handleTitle = (newTitle: string) => {
            setTitle(newTitle);
        };

        socket.on("receive-title", handleTitle);

        return () => {
            socket.off("receive-title", handleTitle);
        };
    }, []);

    useEffect(() => {
        const handleOnlineUsers = (users: CurrentUser[]) => {
            setOnlineUsers(users);
        };

        socket.on("online-users", handleOnlineUsers);

        return () => {
            socket.off("online-users", handleOnlineUsers);
        };
    }, []);

    useEffect(() => {
        if (!editor) return;

        const current = editor.getJSON();

        if (JSON.stringify(current) !== JSON.stringify(content)) {
            editor.commands.setContent(content, {emitUpdate: false,});
        }
    }, [editor, content]);

    return (
        <AuthGuard>
          <Navbar saveStatus={saveStatus} canEdit={canEdit} onShare={() => setShareOpen(true)} onDelete={handleDelete} onlineUsers={onlineUsers}/>
            <div className={styles.container}>
                <div className={styles.editorWrapper}>
                    <input className={styles.titleInput} value={title} disabled={!canEdit}  placeholder="Untitled Document"
                        onChange={(e) => { setTitle(e.target.value); setHasChanges(true);  setSaveStatus("saving");}}/>
                    {canEdit && (<Toolbar editor={editor} />)} 
                    <Editor editor={editor} />
                </div>
            </div>
            <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} documentId={params.id}/>
        </AuthGuard>
    );
}