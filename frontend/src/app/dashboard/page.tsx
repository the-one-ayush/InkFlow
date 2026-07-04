"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import {logout} from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import styles from "./page.module.css";

interface Document {
    id: string;
    title: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

interface SharedDocument extends Document {
    owner: {
        id: string;
        name: string;
    };
}

export default function DashboardPage() {
    const router= useRouter();
    const [ownedDocuments, setOwnedDocuments]= useState<Document[]>([]);
    const [sharedDocuments, setSharedDocuments]= useState<SharedDocument[]>([]);
    const [loading, setLoading]= useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments= async () => {
        try {
            const response= await api.get("/documents");
            setOwnedDocuments(response.data.ownedDocuments);
            setSharedDocuments(response.data.sharedDocuments);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const createDocument = async () => {
        try {
            const response = await api.post("/documents", {title: "Untitled Document",  });
            router.push(`/document/${response.data.document.id}`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace("/login");
    };

    return (
        <AuthGuard>
            <div className={styles.page}>
                <header className={styles.header}>
                    <h1 className={styles.logo}>
                        <Link href="/">InkFlow</Link>
                    </h1>

                    <button className={styles.logout} onClick={handleLogout}>
                        Logout
                    </button>
                </header>

                <main className={styles.main}>
                    <div className={styles.topRow}>
                        <h2>Dashboard</h2>

                        <button className={styles.newButton} onClick={createDocument}>
                            + New Document
                        </button>

                    </div>

                    {loading ? (<p>Loading...</p>) : (

                        <>
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    My Documents
                                </h3>
                                {ownedDocuments.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <h2>No documents yet</h2>
                                        <p>Create your first document to get started.</p>
                                    </div>
                                ) : (
                                    <div className={styles.grid}>
                                        {ownedDocuments.map( (document) => (

                                                <div key={document.id} className={styles.card} onClick={() => router.push(`/document/${document.id}`) }>

                                                    <div className={styles.icon}>
                                                        📄
                                                    </div>
                                                    <h3>{document.title}</h3>
                                                    <p>Last edited{" "} {new Date(document.updatedAt).toLocaleDateString()}</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                            </section>
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Shared With Me</h3>
                                {sharedDocuments.length === 0 ? (
                                    <div className={styles.emptySmall}>
                                        Nothing has been shared with you yet.
                                    </div>
                                ) : (
                                    <div className={styles.grid}>
                                        {sharedDocuments.map( (document) => (
                                                <div
                                                    key={document.id} className={styles.card} onClick={() => router.push(`/document/${document.id}`) }>

                                                    <div className={styles.icon}>
                                                        👤
                                                    </div>

                                                    <h3>{document.title}</h3>
                                                    <p>Shared by{" "}
                                                        <strong>{document.owner.name}</strong>
                                                    </p>

                                                    <p>Last edited{" "} {new Date(document.updatedAt).toLocaleDateString()}</p>
                                                </div>
                                            )
                                        )}

                                    </div>
                                )}
                            </section>
                        </>
                    )}

                </main>
            </div>
        </AuthGuard>
    );
}