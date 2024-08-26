'use client'

import { NextUIProvider } from "@nextui-org/react"
import React from "react"
import { useState, useEffect } from "react";
import { Spinner } from "@nextui-org/react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true)
    }, []);

    if (!mounted) return (
        <div className="w-screen h-screen flex flex-col justify-center items-center"
            style={{ width: '100%', height: '96vh', display: "flex", justifyContent: 'center', alignItems: 'center' }}>
            {/* <CircularProgress size="sm" aria-label="Loading..." /> */}
            {/* <NextUIProvider>
                <Spinner label="Loading..." color="warning" />
            </NextUIProvider> */}
        </div>
    );
    return (
        <NextUIProvider>
            {children}
        </NextUIProvider>
    )
}