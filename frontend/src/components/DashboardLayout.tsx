import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Bot, LogOut, PlusCircle, History } from "lucide-react"; // Add History icon

// Add props to manage the active view
export function DashboardLayout({ 
    onLogout, 
    children, 
    activeView, 
    setActiveView 
}: { 
    onLogout: () => void, 
    children: ReactNode,
    activeView: string,
    setActiveView: (view: 'generator' | 'history') => void
}) {
    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col p-4 border-r bg-muted/40">
                <div className="flex items-center gap-2 mb-8">
                    <Bot className="h-6 w-6" />
                    <h1 className="text-lg font-bold">Data Mocker AI</h1>
                </div>
                <div className="space-y-2">
                    <Button 
                        variant={activeView === 'generator' ? 'secondary' : 'ghost'} 
                        className="w-full justify-start gap-2" 
                        onClick={() => setActiveView('generator')}
                    >
                        <PlusCircle className="h-4 w-4" />
                        New Generation
                    </Button>
                    <Button 
                        variant={activeView === 'history' ? 'secondary' : 'ghost'} 
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveView('history')}
                    >
                        <History className="h-4 w-4" />
                        Usage History
                    </Button>
                </div>
                <div className="mt-auto">
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={onLogout}>
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-4xl h-full flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}