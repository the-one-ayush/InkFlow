"use client";

import styles from "./Navbar.module.css";
import {useRouter} from "next/navigation";
import {logout} from "@/lib/auth";
import Link from "next/link";

interface OnlineUser {
    id: string;
    name: string;
    email: string;
}

interface NavbarProps {
    saveStatus: "saved" | "saving";
    onShare: () => void;
    onDelete: () => void;
    canEdit: boolean;
    onlineUsers: OnlineUser[];
}

export default function Navbar({saveStatus, canEdit, onShare, onlineUsers, onDelete}: NavbarProps) {
    const router= useRouter();

    return (
        <nav className={styles.navbar}>
            <h2 className={styles.logo}>
                <Link href="/">InkFlow</Link>
            </h2>

            <div className={styles.right}>
                <div className={styles.onlineSection}>
                    <span className={styles.onlineLabel}>Currently Editing</span>

                    {onlineUsers.length === 0 ? (
                        <span className={styles.empty}>
                            —
                        </span>
                    ) : (
                        onlineUsers.map((user) => (
                            <div key={user.id} className={styles.user}>
                                <span className={styles.dot}/>
                                <span>{user.name}</span>
                            </div>
                        ))
                    )}
                </div>

                <span className={styles.status}>
                    {saveStatus === "saving" ? "Saving...": "Saved"}
                </span>

                {canEdit && (
                    <>
                        <button className={styles.deleteButton} onClick={onDelete}>Delete</button>
                        <button className={styles.button} onClick={onShare}>Share</button>
                    </>
                )}
                <button className={styles.button} onClick={() => {logout(); router.replace("/login");}}>Logout</button>

            </div>
        </nav>
    );
}