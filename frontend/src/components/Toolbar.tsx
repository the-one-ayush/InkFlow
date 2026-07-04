"use client";

import type {Editor} from "@tiptap/react";
import {Bold, Italic, Heading1, List, ListOrdered, Undo2, Redo2,} from "lucide-react";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
    editor: Editor | null;
}

export default function Toolbar({editor}: ToolbarProps) {
    if (!editor) {
        return null;
    }

    return (
        <div className={styles.toolbar}>

            <button className={`${styles.button} ${editor.isActive("bold")? styles.active: ""}`}
                onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
                <Bold size={18} />
            </button>

            <button className={`${styles.button} ${editor.isActive("italic")? styles.active: ""}`}
                onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
                <Italic size={18} />
            </button>

            <button className={`${styles.button} ${editor.isActive("heading", {level: 1,})? styles.active: ""}`}
                onClick={() => editor.chain().focus().toggleHeading({level: 1,}) .run()}  title="Heading">
                <Heading1 size={18} />
            </button>

            <button className={`${styles.button} ${ editor.isActive("bulletList") ? styles.active : "" }`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullet List" >
                <List size={18} />
            </button>

            <button className={`${styles.button} ${ editor.isActive("orderedList") ? styles.active: ""}`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
                <ListOrdered size={18} />
            </button>

            <div className={styles.divider} />

            <button className={styles.button}
                onClick={() =>  editor.chain().focus().undo().run()} disabled={ !editor.can().chain().focus().undo().run()} title="Undo" >
                <Undo2 size={18} />
            </button>

            <button className={styles.button}  onClick={() =>  editor.chain().focus().redo().run() }
                disabled={ !editor.can().chain().focus().redo().run()} title="Redo">
                <Redo2 size={18} />
            </button>
        </div>
    );
}