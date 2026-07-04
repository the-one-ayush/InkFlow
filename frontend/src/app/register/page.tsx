"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/axios";

import styles from "../login/page.module.css";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        try {
            setLoading(true);

            await api.post("/auth/register", {
                name,
                email,
                password,
            });

            alert("Registration successful");

            router.push("/login");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(
                    error.response?.data?.message ??
                    "Registration failed"
                );
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

                <p className={styles.tagline}>
                    Real-time collaborative editing.
                </p>
            </div>

            <div className={styles.card}>

                <h2 className={styles.title}>
                    Create your account
                </h2>

                <p className={styles.subtitle}>
                    Start collaborating in seconds.
                </p>

                <input
                    className={styles.input}
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />

                <input
                    className={styles.input}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <input
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button
                    className={styles.button}
                    onClick={handleRegister}
                    disabled={loading}
                >
                    {loading
                        ? "Creating Account..."
                        : "Create Account"}
                </button>

                <p className={styles.footer}>
                    Already have an account?{" "}

                    <span
                        className={styles.link}
                        onClick={() =>
                            router.push("/login")
                        }
                    >
                        Sign In
                    </span>

                </p>

            </div>

        </div>
    );
}