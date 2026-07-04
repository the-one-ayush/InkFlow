"use client";

import {useEffect, useState} from "react";
import api from "@/lib/axios";
import styles from "./ShareDialog.module.css";
import axios from "axios";

interface User {
    id: string;
    name: string;
    email: string;
}

interface Member {
    id: string;
    role: "OWNER" | "EDITOR" | "VIEWER";
    user: User;
}

interface ShareDialogProps {
    open: boolean;
    onClose: () => void;
    documentId: string;
}

export default function ShareDialog({open, onClose, documentId,}: ShareDialogProps) {
    const [email, setEmail]= useState("");
    const [role, setRole]= useState<"EDITOR" | "VIEWER">("EDITOR");

    const [members, setMembers]= useState<Member[]>([]);

    const [loading, setLoading]= useState(false);

    const fetchMembers = async () => {
        try {
            const response = await api.get(`/documents/${documentId}/members`);
            setMembers(response.data.members);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!open) return;

        fetchMembers();
    }, [open]);

    const inviteUser = async () => {
        if (!email.trim()) return;

        try {
            setLoading(true);
            await api.post(`/documents/${documentId}/share`, {email, role,});
            setEmail("");
            fetchMembers();
        } catch (error) {
    if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message ?? "Failed to share document");
    } else {
        alert("Something went wrong");
    }
} finally {
            setLoading(false);
        }
    };

    if (!open) {
        return null;
    }

    const updateRole= async (memberId: string,  role: "EDITOR" | "VIEWER") => {
    try {
        await api.patch(`/documents/${documentId}/members/${memberId}`, {role,});
        setMembers((prev) => prev.map((member) => member.id === memberId ? {...member, role,} : member));

    } catch (error) {
        console.error(error);
        alert("Failed to update role");
    }
};

const removeMember= async (memberId: string) => {
    if (!confirm("Remove this user from the document?")) {
        return;
    }

    try {
        await api.delete(`/documents/${documentId}/members/${memberId}`);
        setMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (error) {
        console.error(error);
        alert("Failed to remove member");
    }
};

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Share</h2>
                    <button className={styles.close} onClick={onClose}>✕</button>
                </div>

                <div className={styles.section}>
                    <label>Invite by email</label>

                    <input className={styles.input} placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}>
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                    </select>

                    <button className={styles.inviteButton} onClick={inviteUser} disabled={loading}>
                        {loading? "Inviting...": "Invite"}
                    </button>

                </div>
                <div className={styles.divider}/>
                <div className={styles.section}>

                    <h3>People with access</h3>

                    <div className={styles.memberList}>

                        {members.map((member) => (

                            <div key={member.id} className={styles.member}>

                                <div className={styles.memberInfo}>
                                    <p className={styles.name}>{member.user.name}</p>
                                    <p className={styles.email}>{member.user.email}</p>
                                </div>

                                {member.role === "OWNER" ? (
                                    <span className={styles.ownerBadge}>Owner</span>
                                ) : (
                                    <div className={styles.actions}>
                                        <select className={styles.roleSelect} value={member.role} onChange={(e) => updateRole(member.id, e.target.value as "EDITOR" | "VIEWER")}>
                                            <option value="EDITOR">Editor</option>
                                            <option value="VIEWER">Viewer</option>
                                        </select>

                                        <button className={styles.removeButton} onClick={() => removeMember(member.id)}>Remove</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}