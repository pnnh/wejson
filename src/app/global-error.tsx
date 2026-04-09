"use client";

export default function GlobalError({error}: { error: Error & { digest?: string } }) {
    return (
        <html>
        <body>
        {error.name}
        </body>
        </html>
    );
}
