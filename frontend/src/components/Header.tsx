'use client';

import { UserNav } from "@/components/UserNav";
import { Bot } from "lucide-react";

export function Header({ user, onLogout }: { user: any | null; onLogout: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between px-4 md:px-6 border-b">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6" />
        <h1 className="text-lg font-bold">Data Mocker AI</h1>
      </div>
      {/* <UserNav onLogout={onLogout} firstName={user?.first_name} username={user?.username} email={user?.sub} /> */}
      <UserNav onLogout={onLogout} user={user} />
    </header>
  );
}