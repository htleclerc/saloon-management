"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ConfigurationPage() {
    useEffect(() => {
        redirect("/configuration/workshop");
    }, []);

    return null;
}
