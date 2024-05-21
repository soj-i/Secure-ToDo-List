"use client";
import { useEffect } from "react";
import { useRouter } from 'next/navigation'

// This is the default page that gets executed when you visit
// http://localhost:3000. This redirects to /home.
export default function GoHome () {
    const router = useRouter();
    // This hook executes when the page renders
    useEffect(() => {
        if (!window.localStorage.getItem("jwt")) router.replace("/login");
        else router.replace("/home");
    }, [])
}