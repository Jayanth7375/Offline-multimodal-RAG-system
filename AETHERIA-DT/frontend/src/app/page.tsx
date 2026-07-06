'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import styles from './page.module.css';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { BoltStyleChat } from "@/components/ui/bolt-style-chat";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarInput,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  InfoCard,
  InfoCardContent,
  InfoCardTitle,
  InfoCardDescription,
  InfoCardMedia,
  InfoCardFooter,
  InfoCardDismiss,
  InfoCardAction,
} from "@/components/ui/info-card";
import {
  ExternalLink,
  User,
  ChevronsUpDown,
  History,
  Search,
  Settings,
  MessageSquarePlus,
  Bolt,
  X,
  Download,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

import { motion, AnimatePresence } from "motion/react";
import { BackgroundLayer } from "@/components/ui/background-layer";

const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ref.current && chart.trim()) {
      const render = async () => {
        try {
          mermaid.initialize({ startOnLoad: false, theme: 'base', securityLevel: 'loose' });
          const id = `d-${Math.random().toString(36).substr(2, 5)}`;

          let lines = chart.trim().split('\n');
          let cleanLines = ['graph TD'];
          for (let line of lines) {
            let p = line.trim()
              .replace(/graph (TD|LR|BT|RL)/g, '')
              .replace(/\|>/g, '|')
              .replace(/->\|/g, '-->|')
              .replace(/\[/g, '(["').replace(/\]/g, '"])');
            if (p.includes('-->') || p.includes('(["')) cleanLines.push(p);
          }
          const { svg } = await mermaid.render(id, cleanLines.join('\n'));
          if (ref.current) {
            ref.current.innerHTML = svg;
            setError(false);
          }
        } catch (e) {
          setError(true);
        }
      };
      render();
    }
  }, [chart]);

  return (
    <div className={styles.mermaidContainer}>
      <div ref={ref} className={styles.mermaidBox} />
      {error && <pre className={styles.fallback}>{chart}</pre>}
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total_documents: 0, model: 'Llama 3' });
  const [user, setUser] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Advanced AI Controls
  const [model, setModel] = useState('llama3:latest');
  const [systemPrompt, setSystemPrompt] = useState('You are Aetheria. Rule: For diagrams, ALWAYS use Mermaid blocks: ```mermaid [code] ```. Use [Node] only.');
  const [temp, setTemp] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [showSettings, setShowSettings] = useState(false);

  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const sendRef = useRef<any>(null);
  useEffect(() => { sendRef.current = sendMessage; });

  useEffect(() => {
    const session = localStorage.getItem('currentUser');
    if (!session) return router.push('/login');
    setUser(JSON.parse(session));
    fetchStats();

    const savedHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
    setHistory(savedHistory.filter((h: any) => h.user === JSON.parse(session).email));

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.length > 2 && sendRef.current) {
          sendRef.current(transcript);
        }
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) { }
  };

  const exportChat = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.json`;
    a.click();
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/upload', { method: 'POST', body: fd });
      if (res.ok) {
        fetchStats();
        setMessages(prev => [...prev, { role: 'ai', content: `✅ Document **${file.name}** is now in the vault.` }]);
        setUploadedFiles(prev => [...prev, file.name]);
      } else {
        console.error("Upload failed with status:", res.status);
      }
    } catch (err) {
      console.error("Upload network error:", err);
    }
    finally { setIsUploading(false); }
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      // Strip markdown and code blocks
      const cleanText = text
        .replace(/```[\s\S]*?```/g, '[Diagram]')
        .replace(/[*#`\[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async (msgOverride?: string) => {
    const msg = msgOverride || input;
    if (!msg.trim() || isTyping) return;

    const currentHistory = messages.map(m => ({ role: m.role, content: m.content }));
    if (!msgOverride) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }, { role: 'ai', content: '' }]);
    setIsTyping(true);

    try {
      const fd = new FormData();
      fd.append('message', msg);
      fd.append('history', JSON.stringify(currentHistory));
      fd.append('model', model);
      fd.append('system_prompt', systemPrompt);
      fd.append('temperature', temp.toString());
      fd.append('top_p', topP.toString());

      const res = await fetch('http://localhost:8000/chat', { method: 'POST', body: fd });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let stream = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        stream += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = stream;
          return updated;
        });
      }

      if (msgOverride) speak(stream);

      // Auto-Commit History
      setMessages(prev => {
        const fullChat = [...prev];
        const newHistory = {
          id: Date.now(),
          title: msg.slice(0, 30) + (msg.length > 30 ? '...' : ''),
          messages: fullChat,
          user: user.email,
          timestamp: new Date().toISOString()
        };
        const updatedHistory = [newHistory, ...history].slice(0, 20);
        const globalHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
        localStorage.setItem('chat_history', JSON.stringify([newHistory, ...globalHistory]));
        setHistory(updatedHistory);
        return prev;
      });
    } catch (e) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = '⚠️ Connection lost. Ensure backend is running.';
        return updated;
      });
    } finally { setIsTyping(false); }
  };

  if (!user) return null;

  const filteredHistory = history.filter(h => h.title.toLowerCase().includes(search.toLowerCase()));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r border-white/5 bg-[#0f0f0f]">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#d4af37] text-black">
              <Bolt className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold text-lg tracking-tight">Aetheria</span>
              <span className="text-[10px] text-[#d4af37] font-medium uppercase tracking-widest">Enterprise</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/40">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="w-full justify-start h-10 hover:bg-white/5 text-white/90"
                    onClick={() => window.location.reload()}
                  >
                    <MessageSquarePlus className="size-4 mr-2 text-[#d4af37]" />
                    <span>New Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="w-full justify-start h-10 hover:bg-white/5 text-white/90"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="size-4 mr-2" />
                    <span>AI Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-4 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="text-white/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="size-3" />
                <span>Recents</span>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <div className="px-2 mb-4">
                <div className="relative group">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-[#d4af37] transition-colors" />
                  <SidebarInput
                    placeholder="Search history..."
                    className="pl-8 bg-white/5 border-white/10 h-9 text-xs focus-visible:ring-[#d4af37]/50"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <SidebarMenu>
                {filteredHistory.map(item => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      className="w-full justify-start py-2.5 h-auto text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      onClick={() => {
                        setMessages(item.messages);
                        setIsTyping(false);
                        setInput('');
                      }}
                    >
                      <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                        <span className="truncate w-full font-medium">{item.title}</span>
                        <span className="text-[10px] text-white/30">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {filteredHistory.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-white/20 italic">
                    No matching history found
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <div className="mx-4 gold-line opacity-10"></div>
        <SidebarFooter className="p-4">
          <InfoCard className="mb-4 bg-white/5 border-white/10 group-data-[collapsible=icon]:hidden" storageKey="aetheria-v2-info" dismissType="once">
            <InfoCardContent>
              <InfoCardTitle className="text-white text-sm">Aetheria Private AI</InfoCardTitle>
              <InfoCardDescription className="text-white/50 text-[10px]">
                All data stays on your machine.
              </InfoCardDescription>
              <InfoCardMedia
                media={[
                  { src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400" },
                  { src: "https://images.unsplash.com/photo-1620712943543-bcc4638d9980?auto=format&fit=crop&q=80&w=400" },
                ]}
                shrinkHeight={60}
                expandHeight={120}
              />
              <InfoCardFooter className="mt-2">
                <InfoCardDismiss className="text-[#d4af37] hover:underline cursor-pointer">Later</InfoCardDismiss>
                <InfoCardAction>
                  <Link href="#" className="flex flex-row items-center gap-1 text-white hover:underline transition-all">
                    Details <ExternalLink size={10} />
                  </Link>
                </InfoCardAction>
              </InfoCardFooter>
            </InfoCardContent>
          </InfoCard>

          <SidebarMenu>
            <SidebarMenuItem className="relative">
              <AnimatePresence>
                {showLogout && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 w-full mb-2 z-50 px-2"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl py-2.5 text-xs font-bold transition-all shadow-lg backdrop-blur-md flex items-center justify-center gap-2 group"
                    >
                      <X className="size-3 group-hover:rotate-90 transition-transform" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <SidebarMenuButton 
                size="lg" 
                onClick={() => setShowLogout(!showLogout)}
                className={cn(
                  "w-full transition-all border",
                  showLogout ? "bg-white/10 border-white/20" : "bg-white/5 hover:bg-white/10 border-white/10"
                )}
              >
                <div className="flex items-center gap-3 px-1 w-full">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                    <User className="size-5" />
                  </div>
                  <div className="flex flex-col items-start gap-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="text-xs font-semibold leading-none text-white">Project Admin</span>
                    <span className="text-[10px] leading-none text-white/40 truncate w-full">{user.email}</span>
                  </div>
                  <ChevronsUpDown className={cn(
                    "ml-auto size-4 text-white/20 transition-transform group-data-[collapsible=icon]:hidden",
                    showLogout && "rotate-180"
                  )} />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="relative flex flex-col h-screen overflow-hidden bg-transparent">
        <BackgroundLayer />
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 sticky top-0 bg-[#070707]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-[#8a8a8f] hover:text-[#d4af37]" />
            <div className="gold-line-vertical h-4 mx-2 opacity-20"></div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10">
              <div className="size-1.5 rounded-full bg-[#d4af37] animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Secure Workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-[10px] font-medium text-[#666662]">
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-4">
                <span>Models: Llama 3</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Vault: 2 docs</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 gold-line opacity-20"></div>
        </header>

        <main className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
          <input type="file" hidden ref={fileRef} onChange={handleUpload} />

          <AnimatePresence>
            {showSettings && (
              <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className={styles.settingsPane}
                >
                  <div className={styles.settingsHeader}>
                    <h3>AI Configuration</h3>
                    <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-[#d4af37] transition-colors p-1">
                      <X className="size-6" />
                    </button>
                  </div>

                  <div className={styles.settingItem}>
                    <label>
                      Active Model
                      <span className="text-[10px] bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded-full border border-[#d4af37]/20">
                        Primary
                      </span>
                    </label>
                    <select
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white w-full appearance-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 outline-none transition-all cursor-pointer"
                    >
                      <option value="llama3:latest">Llama 3 (Fast)</option>
                      <option value="llava:latest">Llava (Vision)</option>
                      <option value="mistral:latest">Mistral</option>
                      <option value="phi3:latest">Phi-3 (Lightweight)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className={styles.settingItem}>
                      <label>
                        Temperature
                        <span className={styles.settingValue}>{temp.toFixed(1)}</span>
                      </label>
                      <input
                        type="range"
                        min="0" max="1" step="0.1"
                        value={temp}
                        onChange={e => setTemp(parseFloat(e.target.value))}
                        className={styles.rangeInput}
                      />
                    </div>
                    <div className={styles.settingItem}>
                      <label>
                        Top-P
                        <span className={styles.settingValue}>{topP.toFixed(1)}</span>
                      </label>
                      <input
                        type="range"
                        min="0" max="1" step="0.1"
                        value={topP}
                        onChange={e => setTopP(parseFloat(e.target.value))}
                        className={styles.rangeInput}
                      />
                    </div>
                  </div>

                  <div className={styles.settingItem}>
                    <label>System Persona</label>
                    <textarea
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      placeholder="Define AI behavior..."
                      className="bg-white/5 border border-white/10 rounded-xl p-4 text-white h-32 resize-none w-full text-sm leading-relaxed focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 outline-none transition-all"
                    />
                  </div>

                  <div className={styles.settingsFooter}>
                    <button className={styles.exportBtn} onClick={exportChat}>
                      <Download className="size-4" />
                      Export Chat Log
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="bg-[#d4af37] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                    >
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <div className="flex-1 relative flex flex-col min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col pt-4">
                <BoltStyleChat
                  onSend={(msg) => sendMessage(msg)}
                  onUploadClick={() => fileRef.current?.click()}
                  onMicClick={() => {
                    if (isListening) recognitionRef.current?.stop();
                    else { setIsListening(true); recognitionRef.current?.start(); }
                  }}
                  isListening={isListening}
                  selectedModel={model}
                  onModelChange={setModel}
                  input={input}
                  onInputChange={setInput}
                  sources={uploadedFiles}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col relative overflow-hidden">
                <div className={styles.authContainer} style={{ position: 'fixed', inset: 0, opacity: 0.1, pointerEvents: 'none', zIndex: 0 }}></div>

                <div className={styles.threadContainer}>
                  <div className={styles.centeredThread}>
                    {messages.map((m, i) => (
                      <div key={i} className={cn(
                        styles.messageTurn,
                        m.role === 'ai' ? styles.aiTurn : styles.userTurn
                      )}>
                        <div className={cn(
                          styles.avatarContainer,
                          m.role === 'ai' ? styles.aiAvatar : styles.userAvatar
                        )}>
                          {m.role === 'ai' ? <Bolt size={16} /> : <User size={16} />}
                        </div>

                        <div className={m.role === 'ai' ? styles.aiRow : styles.userRow}>
                          <div className={cn(
                            styles.bubble,
                            "shadow-xl"
                          )}>
                            {m.content.startsWith("System Notice:") ? (
                              <div className={styles.systemNotice}>
                                <AlertCircle className="size-5 shrink-0" />
                                <div>{m.content}</div>
                              </div>
                            ) : (
                              <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                                <ReactMarkdown
                                  components={{
                                    code({ node, className, children, ...props }) {
                                      const val = String(children);
                                      const isChart = /mermaid/i.test(className || '') || val.includes('graph ');
                                      if (isChart) return <Mermaid chart={val} />;
                                      return <code className={className} {...props}>{children}</code>;
                                    },
                                    p({ children }) {
                                      const val = String(children);
                                      if (val.includes('graph ')) return <Mermaid chart={val} />;
                                      return <p className="mb-4 last:mb-0">{children}</p>;
                                    }
                                  }}
                                >
                                  {m.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className={styles.aiTurn + " flex gap-3"}>
                        <div className={styles.aiAvatar + " " + styles.avatarContainer}>
                          <Bolt size={16} />
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-[#d4af37] animate-bounce"></span>
                          <span className="size-1.5 rounded-full bg-[#d4af37] animate-bounce [animation-delay:0.2s]"></span>
                          <span className="size-1.5 rounded-full bg-[#d4af37] animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    )}
                    <div ref={endRef} className="h-20" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent z-20 sticky bottom-0">
                  <div className="max-w-3xl mx-auto">
                    <BoltStyleChat
                      title=""
                      subtitle=""
                      announcementText=""
                      onSend={(msg) => sendMessage(msg)}
                      onUploadClick={() => fileRef.current?.click()}
                      onMicClick={() => {
                        if (isListening) recognitionRef.current?.stop();
                        else { setIsListening(true); recognitionRef.current?.start(); }
                      }}
                      isListening={isListening}
                      selectedModel={model}
                      onModelChange={setModel}
                      input={input}
                      onInputChange={setInput}
                      sources={uploadedFiles}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
