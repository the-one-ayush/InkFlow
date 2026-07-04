"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/axios";
import styles from "./page.module.css";

export default function LoginPage() {
    const router= useRouter();

    const [email, setEmail]= useState("");
    const [password, setPassword]= useState("");
    const [loading, setLoading]= useState(false);

    const handleLogin= async () => {
        try {
            setLoading(true);

            const response= await api.post("/auth/login", {email, password,});
            localStorage.setItem("token", response.data.token);
            router.push("/dashboard");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message ?? "Login failed");
            } else {
                alert("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.logo}>
                    <Link href="/">InkFlow</Link>
                </h1>

                <p className={styles.tagline}>Real-time collaborative editing.</p>
            </div>

            <div className={styles.card}>
                <h2 className={styles.title}>
                    Welcome back 👋
                </h2>

                <p className={styles.subtitle}>Sign in to continue editing your documents.</p>

                <input className={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input className={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>

                <button className={styles.button} onClick={handleLogin} disabled={loading}>
                    {loading ? "Signing In...": "Sign In"}
                </button>

                <p className={styles.footer}>
                    Don't have an account?{" "}

                    <span onClick={() => router.push("/register")} className={styles.link}>
                        Create one
                    </span>
                </p>
            </div>
        </div>
    );
}