"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({children,}: AuthGuardProps) {
    const router= useRouter();
    const [loading, setLoading]= useState(true);

    useEffect(() => {
        const verifyUser= async () => {
            try {
                await api.get("/auth/me");
                setLoading(false);
            } catch (error) {
                console.error("Authentication failed:", error);
                localStorage.removeItem("token");
                router.replace("/login");
            }
        };

        verifyUser();
    }, [router]);

    if (loading) {
        return (
            <div style={{height: "100vh", display: "flex",justifyContent: "center", alignItems: "center", fontSize: "18px",}}>
                Loading...
            </div>
        );
    }

    return <>{children}</>;
}