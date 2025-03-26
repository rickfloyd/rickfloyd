"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set dark mode and remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased dark";
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <body className="antialiased dark" suppressHydrationWarning>
      {children}
    </body>
  );
}
