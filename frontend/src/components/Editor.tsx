"use client";

import {EditorContent, type Editor as TiptapEditor,} from "@tiptap/react";
import styles from "./Editor.module.css";

interface EditorProps {
    editor: TiptapEditor | null;
}

export default function Editor({editor,}: EditorProps) {
    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} className={styles.ProseMirror}/>;
}