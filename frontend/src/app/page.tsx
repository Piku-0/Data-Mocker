'use client';

import { useState, useEffect, ReactNode, useRef } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { AxiosError } from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle , CardFooter} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { LogOut, Bot, Loader2, Download, Send, History, PlusCircle, MessageSquare, MoreVertical, Edit, Share2, PanelLeftClose, Square, PanelLeftOpen, Eye, EyeOff, Copy } from "lucide-react";
import Papa from 'papaparse';
import TextareaAutosize from 'react-textarea-autosize';

// Custom Components
import { LandingPage } from '@/components/LandingPage';
import { PromptBar } from '@/components/PromptBar';
import { UsageHistory } from '@/components/UsageHistory';
import { SidebarTooltip } from '@/components/SidebarTooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Header } from '@/components/Header';

import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Archive, ArchiveRestore } from "lucide-react";


// --- Type Definitions ---
interface Exchange {
  prompt: string;
  data: any[];
  isGenerating?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  exchanges: Exchange[];
  isTemporary?: boolean;
  is_archived?: boolean; // Add this
}

// --- Main App Setup ---
const queryClient = new QueryClient();

export default function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

function getEmailFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

function getUserDataFromToken(token: string): any | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
}

// --- App Component ---
function App() {
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [nextChatIsTemporary, setNextChatIsTemporary] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null); // New state for email
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setToken(storedToken);
      setCurrentUserEmail(getEmailFromToken(storedToken));
      setCurrentUser(getUserDataFromToken(storedToken));
      const savedSessions = localStorage.getItem('chatSessions');
      if (savedSessions) {
        setChatSessions(JSON.parse(savedSessions));
      }
      setView('dashboard');
    } else {
      setView('landing');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const sessionsToSave = chatSessions.filter(session => !session.isTemporary);
    if (sessionsToSave.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessionsToSave));
    } else {
      localStorage.removeItem('chatSessions');
    }
  }, [chatSessions]);

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setCurrentUserEmail(getEmailFromToken(newToken)); // Decode and set email
      setCurrentUser(getUserDataFromToken(newToken));
      setView('dashboard');
    } else {
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];
      setCurrentUserEmail(null); // Clear email on logout
      setCurrentUser(null);
      setActiveChatId(null);
      setView('landing');
    }
  };

  const handleNewChat = () => {
    setNextChatIsTemporary(false);
    setActiveChatId(null);
  };

  const handleNewTemporaryChat = () => {
    setNextChatIsTemporary(true);
    setActiveChatId(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (activeChatId === sessionId) setActiveChatId(null);
    toast.info("Chat deleted.");
  };

  const handleArchiveSession = (sessionId: string, isArchived: boolean) => {
    // This is now a frontend-only operation for simplicity
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, is_archived: !isArchived } : session
    ));
    toast.success(`Chat ${isArchived ? 'unarchived' : 'archived'}.`);
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, title: newTitle } : session
    ));
    toast.success("Chat renamed.");
  };
  
  if (isLoading) { return <main className="flex min-h-screen flex-col items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /></main> }
  if (view === 'landing') return <LandingPage onLoginClick={() => setView('login')} />;
  if (view === 'login') return <LoginPage setToken={handleSetToken} onSwitchToRegister={() => setView('register')} />;
  if (view === 'register') return <RegisterPage onSwitchToLogin={() => setView('login')} />;


  return (
    <DashboardLayout 
        onLogout={() => handleSetToken(null)}
        email={currentUserEmail} // Pass email to the layout
        user={currentUser} // Pass the full user object
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        onNewChat={handleNewChat}
        onNewTemporaryChat={handleNewTemporaryChat}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        handleDeleteSession={handleDeleteSession}
        handleArchiveSession={handleArchiveSession}
        handleRenameSession={handleRenameSession}
    >
        <DataGenerator 
            token={token}
            chatSessions={chatSessions}
            setChatSessions={setChatSessions}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            isTemporaryMode={nextChatIsTemporary}
            setIsTemporaryMode={setNextChatIsTemporary}
        />
    </DashboardLayout>
  );
}


function LoginPage({ setToken, onSwitchToRegister }: { setToken: (token: string) => void; onSwitchToRegister: () => void; }) {
    const [rememberMe, setRememberMe] = useState(false);
    const [initialEmail, setInitialEmail] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setInitialEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);
    
    const loginMutation = useMutation<any, AxiosError, FormData>({
        mutationFn: (formData) => apiClient.post('/auth/login', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),
        onSuccess: (data, variables) => {
            const accessToken = data.data.access_token;
            setToken(accessToken);
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', variables.get('username') as string);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            toast.success("Login Successful", { description: "Welcome back!" });
        },
        onError: (error) => {
            const errorData = error.response?.data as any;
            // --- FIX: Set the error state instead of a toast ---
            setError(errorData?.detail || 'An unexpected error occurred.');
        },
    });

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const formData = new FormData(event.currentTarget);
        loginMutation.mutate(formData);
    };

     return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                         <div className="space-y-2">
                             <Label htmlFor="username">Email</Label>
                             <Input id="username" name="username" type="email" placeholder="name@example.com" required key={initialEmail} defaultValue={initialEmail} />
                         </div>
                         <div className="space-y-2">
                             <Label htmlFor="password">Password</Label>
                             <Input id="password" name="password" type="password" placeholder="••••••••" required />
                         </div>
                         <div className="flex items-center space-x-2">
                             <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                             <Label htmlFor="remember-me" className="text-sm font-medium">Remember me</Label>
                         </div>
                         {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                         <Button type="submit" disabled={loginMutation.isPending} className="w-full">
                            {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    <p>Don't have an account? <Button variant="link" className="p-0" onClick={onSwitchToRegister}>Sign Up</Button></p>
                </CardFooter>
            </Card>
        </main>
    );
}

function RegisterPage({ onSwitchToLogin }: { onSwitchToLogin: () => void; }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    
    // --- MODIFICATION: Separate state for each icon ---
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (username) {
                try {
                    const response = await apiClient.post('/auth/check-username', { username });
                    if (response.data.exists) {
                        setUsernameError("Username is already taken.");
                    } else {
                        setUsernameError("");
                    }
                } catch (err) {
                    console.error("Failed to check username:", err);
                }
            }
        }, 500); // Wait 500ms after user stops typing
        return () => clearTimeout(handler);
    }, [username]);

    // Debounced check for email
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (email) {
                try {
                    const response = await apiClient.post('/auth/check-email', { email });
                    if (response.data.exists) {
                        setEmailError("An account with this email already exists.");
                    } else {
                        setEmailError("");
                    }
                } catch (err) {
                    console.error("Failed to check email:", err);
                }
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [email]);

    const registerMutation = useMutation<any, AxiosError, FormData>({
        mutationFn: (formData) => {
            // Check for password mismatch before sending to backend
            if (formData.get('password') !== formData.get('confirm_password')) {
                const error = new AxiosError("Passwords do not match");
                error.response = { data: { detail: "Passwords do not match" }, status: 400, statusText: 'Bad Request', headers: {}, config: {} as any };
                return Promise.reject(error);
            }
            return apiClient.post('/auth/register', {
                email: formData.get('email'),
                password: formData.get('password'),
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                username: formData.get('username'),
                confirm_password: formData.get('confirm_password'),
            });
        },
        onSuccess: () => {
            toast.success("Registration Successful", { description: "You can now sign in." });
            onSwitchToLogin();
        },
        onError: (error) => {
            const errorData = error.response?.data as any;
            toast.error("Registration Failed", { description: errorData?.detail || 'An unexpected error occurred.' });
        },
    });

    const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPasswordError(""); // Clear previous errors
        const formData = new FormData(event.currentTarget);
        if (formData.get('password') !== formData.get('confirm_password')) {
            setPasswordError("Passwords do not match.");
            return;
        }
        registerMutation.mutate(formData);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create an Account</CardTitle>
                    <CardDescription>Enter your details to sign up</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1"><Label htmlFor="first_name">First Name</Label><Input id="first_name" name="first_name" required /></div>
                            <div className="space-y-2 flex-1"><Label htmlFor="last_name">Last Name</Label><Input id="last_name" name="last_name" required /></div>
                        </div>
                        
                        {/* --- FIX IS HERE: Removed duplicate fields --- */}
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input 
                                id="username" 
                                name="username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required 
                            />
                            {usernameError && <p className="text-sm text-red-500 pt-1">{usernameError}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                            {emailError && <p className="text-sm text-red-500 pt-1">{emailError}</p>}
                        </div>

                        {/* --- MODIFIED PASSWORD INPUT --- */}
                        <div className="space-y-2 relative">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-1 top-7 h-7 w-7" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        
                        {/* --- MODIFIED Confirm Password Input --- */}
                        <div className="space-y-2 relative">
                            <Label htmlFor="confirm_password">Confirm Password</Label>
                            <Input 
                                id="confirm_password" 
                                name="confirm_password" 
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-1 top-7 h-7 w-7" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            {passwordError && <p className="text-sm text-red-500 pt-1">{passwordError}</p>}
                        </div>

                        <Button type="submit" disabled={registerMutation.isPending} className="w-full">
                            {registerMutation.isPending ? 'Signing Up...' : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    <p>Already have an account? <Button variant="link" className="p-0" onClick={onSwitchToLogin}>Sign In</Button></p>
                </CardFooter>
            </Card>
        </main>
    );
}

function DataGenerator({
  token,
  chatSessions,
  setChatSessions,
  activeChatId,
  setActiveChatId,
  isTemporaryMode,
  setIsTemporaryMode,
}: {
  token: string | null;
  chatSessions: ChatSession[];
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  isTemporaryMode: boolean;
  setIsTemporaryMode: (isTemporary: boolean) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [editingExchange, setEditingExchange] = useState<{ session: ChatSession; index: number } | null>(null);
  const [editText, setEditText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fallbackTitle = (src: string) => {
  const words = (src.match(/[A-Za-z0-9\-]+/g) || []).slice(0, 5);
  const base = (words.length ? words : src.split(/\s+/).slice(0, 3))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (base ? base[0].toUpperCase() + base.slice(1) : 'New Chat').slice(0, 60);
};

  

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleGenerate = async () => {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) { toast.warning("Please enter a prompt."); return; }

  // Abort previous request if running
  if (isFetching) { abortControllerRef.current?.abort(); }
  const newController = new AbortController();
  abortControllerRef.current = newController;

  setIsFetching(true);
  setPrompt('');

  const newExchange: Exchange = { prompt: trimmedPrompt, data: [], isGenerating: true };
  let currentActiveChatId = activeChatId;

  // If no active chat, create one
  if (currentActiveChatId === null) {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat", // temporary
      exchanges: [newExchange],
    };
    setChatSessions(prev => [newChat, ...prev]);
    currentActiveChatId = newChat.id;
    setActiveChatId(newChat.id);
    setIsTemporaryMode(false);

    // Optimistic local fallback title
    const localGuess = fallbackTitle(trimmedPrompt);
    setChatSessions(prev => prev.map(s =>
      s.id === newChat.id ? { ...s, title: localGuess } : s
    ));
  } else {
    // Append exchange to existing chat
    setChatSessions(prev => prev.map(session =>
      session.id === currentActiveChatId
        ? { ...session, exchanges: [...session.exchanges, newExchange] }
        : session
    ));
  }

  try {
    // Streaming endpoint (keeps your original approach with fetch)
    const response = await fetch('http://127.0.0.1:8000/api/data/generate-ai-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ prompt: trimmedPrompt }),
      signal: newController.signal
    });

    if (!response.ok || !response.body) throw new Error(`Network error: ${response.statusText}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    // Read entire stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulatedText += decoder.decode(value, { stream: true });
    }

    // Extract final JSON array (first full array found)
    const finalJsonMatch = accumulatedText.match(/(\[[\s\S]*\])/);
    if (finalJsonMatch && finalJsonMatch[0]) {
      const finalParsedData = JSON.parse(finalJsonMatch[0]);

      // Update the session's last exchange with parsed data
      setChatSessions(prev => prev.map(session => {
        if (session.id === currentActiveChatId) {
          const updatedExchanges = [...session.exchanges];
          updatedExchanges[updatedExchanges.length - 1] = {
            prompt: trimmedPrompt,
            data: finalParsedData,
            isGenerating: false
          };
          return { ...session, exchanges: updatedExchanges };
        }
        return session;
      }));

      // Now ask backend to create a title based on prompt + sample of the response
      const sample = Array.isArray(finalParsedData) ? finalParsedData.slice(0, 2) : finalParsedData;
      apiClient.post('/data/generate-title', { 
        prompt: trimmedPrompt, 
        sample: Array.isArray(finalParsedData) ? finalParsedData.slice(0, 2) : [finalParsedData] 
      })
      .then(res => {
        const serverTitle = (res?.data?.title || '').trim();
        const safeTitle = serverTitle || fallbackTitle(trimmedPrompt);
        setChatSessions(prev => prev.map(session =>
          session.id === currentActiveChatId ? { ...session, title: safeTitle } : session
        ));
      })
      .catch(err => {
        // Keep optimistic title if title generation fails
        console.error("Title generation failed:", err);
      });
    } else {
      // No JSON found — mark generation finished and keep fallback
      setChatSessions(prev => prev.map(session => {
        if (session.id === currentActiveChatId) {
          const updatedExchanges = [...session.exchanges];
          updatedExchanges[updatedExchanges.length - 1] = {
            prompt: trimmedPrompt,
            data: [],
            isGenerating: false
          };
          return { ...session, exchanges: updatedExchanges };
        }
        return session;
      }));
      toast.error("AI did not return valid JSON.");
    }

  } catch (error: any) {
    if (error.name !== 'AbortError') {
      toast.error("Failed to generate data.", { description: String(error) });
      console.error("Generation error:", error);
    }
    // Ensure the exchange generation flag is cleared
    setChatSessions(prev => prev.map(session => {
      if (session.id === currentActiveChatId) {
        const updatedExchanges = [...session.exchanges];
        updatedExchanges[updatedExchanges.length - 1] = {
          ...updatedExchanges[updatedExchanges.length - 1],
          isGenerating: false
        };
        return { ...session, exchanges: updatedExchanges };
      }
      return session;
    }));
  } finally {
    setIsFetching(false);
    abortControllerRef.current = null;
  }
};


  
  const handleDownloadCSV = (data: any[]) => {
      if (!data || data.length === 0) { toast.error("No data to download."); return; }
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'generated_data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleSaveEdit = async () => {
    if (!editingExchange) return;

    const { session, index } = editingExchange;
    const editedPrompt = editText.trim();
    setEditingExchange(null);

    setChatSessions(prev => prev.map(s => {
      if (s.id === session.id) {
        const updatedExchanges = [...s.exchanges];
        updatedExchanges[index] = { prompt: editedPrompt, data: [], isGenerating: true };
        return { ...s, exchanges: updatedExchanges };
      }
      return s;
    }));
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/data/generate-ai-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt: editedPrompt }),
      });
      if (!response.ok || !response.body) { throw new Error(`Network error: ${response.statusText}`); }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      
      const processStream = async ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
        if (done) {
            const finalJsonMatch = accumulatedText.match(/(\[[\s\S]*\])/);
            if (finalJsonMatch && finalJsonMatch[0]) {
                const finalParsedData = JSON.parse(finalJsonMatch[0]);
                setChatSessions(prev => prev.map(s => {
                    if (s.id === session.id) {
                        const updatedExchanges = [...s.exchanges];
                        updatedExchanges[index] = { prompt: editedPrompt, data: finalParsedData };
                        return { ...s, exchanges: updatedExchanges };
                    }
                    return s;
                }));
            }
            return;
        };
        accumulatedText += decoder.decode(value, { stream: true });
        return reader.read().then(processStream);
      };
      await reader.read().then(processStream);
      toast.success("Prompt updated and data regenerated.");
    } catch (error) {
        toast.error("Failed to regenerate data.", { description: String(error) });
    }
  };

  const handleDeleteExchange = (sessionId: string, exchangeIndex: number) => {
    setChatSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
            const updatedExchanges = session.exchanges.filter((_, idx) => idx !== exchangeIndex);
            return { ...session, exchanges: updatedExchanges };
        }
        return session;
    }).filter(session => session.exchanges.length > 0));
    toast.info("Exchange deleted.");
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    }
  };

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    toast.success("Prompt copied to clipboard!");
  };
  
  const activeChat = chatSessions.find(session => session.id === activeChatId);

  return (
    <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {activeChat ? (
                activeChat.exchanges.map((exchange, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex justify-end items-center gap-2 group relative">
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleCopyPrompt(exchange.prompt)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingExchange({ session: activeChat, index }); setEditText(exchange.prompt); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-muted rounded-xl px-4 py-2 max-w-2xl">
                          <p className="font-semibold whitespace-pre-wrap">{exchange.prompt}</p>
                        </div>
                       </div>
                      <div className="w-full max-w-4xl mx-auto">
                        {exchange.isGenerating ? (
                           <div className="flex items-center space-x-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Generating...</span></div>
                        ) : (
                          <Card>
                             <CardHeader>
                               <div className="flex justify-between items-center">
                                 <CardTitle>Generated Data</CardTitle>
                                 <Button variant="outline" size="sm" onClick={() => handleDownloadCSV(exchange.data)}>
                                   <Download className="mr-2 h-4 w-4" /> Download CSV
                                 </Button>
                               </div>
                             </CardHeader>
                             <CardContent>
                               <div className="overflow-auto max-h-[50vh] pr-2">
                                 <Table>
                                     <TableHeader>
                                         <TableRow>
                                             {exchange.data.length > 0 && Object.keys(exchange.data[0]).map(header => <TableHead key={header} className="capitalize sticky top-0 bg-secondary">{header.replace(/_/g, ' ')}</TableHead>)}
                                         </TableRow>
                                     </TableHeader>
                                     <TableBody>
                                         {exchange.data.map((row: any, rowIndex: number) => (
                                            <TableRow key={rowIndex}>
                                                {Object.keys(row).map(key => <TableCell key={key} className="font-mono text-xs">{String(row[key])}</TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                ))
            ) : (
                <div className="flex h-full items-center justify-center text-center">
                    {isTemporaryMode ? (
                        <div>
                            <Square className="h-12 w-12 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold mb-2">Temporary chat</h2>
                            <p className="max-w-md text-muted-foreground">This conversation will not be saved.</p>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">Data Mocker AI</h1>
                            <p className="text-muted-foreground">How can I help you today?</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      <div className="py-4">
        <PromptBar prompt={prompt} setPrompt={setPrompt} handleGenerate={handleGenerate} isFetching={isFetching} />
      </div>
      <Dialog open={editingExchange !== null} onOpenChange={() => setEditingExchange(null)}>
      <DialogContent>
           <DialogHeader>
             <DialogTitle>Edit Prompt</DialogTitle>
           </DialogHeader>
          <TextareaAutosize
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleDialogKeyDown}
            className="w-full p-2 bg-secondary rounded"
            minRows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExchange(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DashboardLayout({
  user,
  onLogout,
  children,
  email, // Receive email prop
  chatSessions,
  activeChatId,
  setActiveChatId,
  onNewChat,
  onNewTemporaryChat,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  handleDeleteSession,
  handleArchiveSession,
  handleRenameSession
}: {
  user: any | null; // Add the type definition for user
  onLogout: () => void;
  children: ReactNode;
  email: string | null;
  chatSessions: ChatSession[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  onNewChat: () => void;
  onNewTemporaryChat: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  handleDeleteSession: (id: string) => void;
  handleArchiveSession: (id: string, isArchived: boolean) => void;
  handleRenameSession: (id: string, title: string) => void;
}) {
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const showSidebar = !isSidebarCollapsed || isHovered;

    const activeSessions = chatSessions.filter(s => !s.is_archived);
    const archivedSessions = chatSessions.filter(s => s.is_archived);

    return (
        <div className="flex h-screen bg-background text-foreground">
            <aside 
                className={`flex flex-col p-4 border-r bg-muted/40 transition-all duration-300 ${showSidebar ? 'w-64' : 'w-20 items-center'}`}
                onMouseEnter={() => { if (isSidebarCollapsed) setIsHovered(true); }}
                onMouseLeave={() => { if (isSidebarCollapsed) setIsHovered(false); }}
            >
                <div className="flex items-center gap-2 mb-4 w-full">
            {showSidebar && <Bot className="h-6 w-6" />}
            {showSidebar && <h1 className="text-lg font-bold">Data Mocker AI</h1>}
            <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto" 
                onClick={() => {
                    setIsSidebarCollapsed(!isSidebarCollapsed);
                    setIsHovered(false);
                }}
            >
                        {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </Button>
                </div>
                
                <div className="flex items-center gap-2 mb-4 w-full">
                    <SidebarTooltip label="New Chat" isCollapsed={!showSidebar}>
                        <Button variant="outline" className={`justify-start gap-2 ${showSidebar ? 'flex-1' : 'w-full justify-center'}`} onClick={onNewChat}>
                            <Edit className="h-4 w-4" />
                            {showSidebar && "New Chat"}
                        </Button>
                    </SidebarTooltip>
                    <SidebarTooltip label="Temporary Chat" isCollapsed={!showSidebar}>
                        <div className={`transition-all duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 w-0'}`}>
                           {showSidebar && <Button variant="outline" size="icon" onClick={onNewTemporaryChat}><Square className="h-4 w-4" /></Button>}
                        </div>
                    </SidebarTooltip>
                </div>

                <div className="flex-grow overflow-y-auto space-y-1 w-full">
                    {showSidebar && <p className="text-xs text-muted-foreground px-2">Recent</p>}
                    {activeSessions.map((session) => (
                        <SidebarTooltip key={session.id} label={session.exchanges[0]?.prompt || session.title} isCollapsed={!showSidebar}>
                            <div className="relative group flex items-center">
                                <Button
                                    variant={activeChatId === session.id ? 'secondary' : 'ghost'}
                                    className="w-full justify-start gap-2 truncate pr-8"
                                    onClick={() => setActiveChatId(session.id)}
                                >
                                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                    {showSidebar && <span className="truncate">{session.title}</span>}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className={`absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 transition-opacity ${showSidebar ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => { setRenamingId(session.id); setNewTitle(session.title); }}>Rename</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toast.info("Share feature coming soon!")}>Share</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleArchiveSession(session.id, false)}>Archive</DropdownMenuItem>
                                        <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-500">Delete</div>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete this chat session and cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteSession(session.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                        
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </SidebarTooltip>
                    ))}

                    {showSidebar && archivedSessions.length > 0 && <p className="text-xs text-muted-foreground px-2 pt-4">Archived</p>}
                    {archivedSessions.map((session) => (
                        <SidebarTooltip key={session.id} label={session.title} isCollapsed={!showSidebar}>
                          <div className="relative group flex items-center">
                              <Button
                                  variant={activeChatId === session.id ? 'secondary' : 'ghost'}
                                  className="w-full justify-start gap-2 truncate pr-8"
                                  onClick={() => setActiveChatId(session.id)}
                              >
                                  <Archive className="h-4 w-4 flex-shrink-0" />
                                  {showSidebar && <span className="truncate">{session.title}</span>}
                              </Button>
                              {showSidebar && (
                                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleArchiveSession(session.id, true)}>
                                    <ArchiveRestore className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </SidebarTooltip>
                      ))}
                </div>
            </aside>
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header onLogout={onLogout} user={user} /> {/* Pass email to Header */}
                <main className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
                    <div className="w-full max-w-4xl h-full flex flex-col">
                        {children}
                    </div>
                </main>
            </div>

            <Dialog open={renamingId !== null} onOpenChange={() => setRenamingId(null)}>
              <DialogContent>
                <DialogHeader><DialogTitle>Rename Chat</DialogTitle></DialogHeader>
                <Textarea value={newTitle} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTitle(e.target.value)} className="min-h-[100px]" />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRenamingId(null)}>Cancel</Button>
                  <Button onClick={() => { handleRenameSession(renamingId!, newTitle); setRenamingId(null); }}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
    );
}