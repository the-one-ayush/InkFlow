"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/axios";
import styles from "./page.module.css";

export default function HomePage() {
    const router= useRouter();

    const [checkingAuth, setCheckingAuth]= useState(true);

    useEffect(() => {
        const checkAuth= async () => {
            const token= localStorage.getItem("token");

            if (!token) {
                setCheckingAuth(false);
                return;
            }

            try {
                await api.get("/auth/me");
                router.replace("/dashboard");
            } catch {
                localStorage.removeItem("token");
                setCheckingAuth(false);
            }
        };

        checkAuth();
    }, [router]);

    if (checkingAuth) {
        return (
            <div className={styles.loading}>
                Loading...
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <nav className={styles.navbar}>
                <h1 className={styles.logo}>
                    InkFlow
                </h1>

                <div className={styles.navActions}>
                    <button className={styles.secondaryButton} onClick={() => router.push("/login")}>
                        Sign In
                    </button>

                    <button className={styles.primaryButton} onClick={() => router.push("/register")}>
                        Get Started
                    </button>
                </div>
            </nav>

            <main className={styles.hero}>

                <h1 className={styles.heroTitle}>Write together.<br />In real time.</h1>

                <p className={styles.heroSubtitle}>
                    A minimal collaborative editor built for
                    students, developers and teams.
                </p>

                <div className={styles.heroButtons}>
                    <button className={styles.primaryButton} onClick={() => router.push("/register")}>
                        Get Started
                    </button>

                    <button className={styles.secondaryButton} onClick={() => router.push("/login")}>
                        Sign In
                    </button>
                </div>

            </main>

            <section className={styles.features}>

                <div className={styles.featureCard}>
                    <h3>⚡ Real-time Collaboration</h3>
                    <p>Edit documents together instantly.</p>
                </div>

                <div className={styles.featureCard}>
                    <h3>📄 Rich Text Editing</h3>
                    <p>
                        Powerful editing with a clean interface.
                    </p>
                </div>

                <div className={styles.featureCard}>
                    <h3>💾 Auto Save</h3>
                    <p>Every change is saved automatically.</p>
                </div>

                <div className={styles.featureCard}>
                    <h3>🔒 Secure Authentication</h3>
                    <p>JWT-based authentication with protected routes.</p>
                </div>
            </section>
        </div>
    );
}