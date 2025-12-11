"use client";

import { SessionProvider } from "next-auth/react";

interface Props {
  children?: React.ReactNode;
}

export default function NextAuthProvider({ children }: Props) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}