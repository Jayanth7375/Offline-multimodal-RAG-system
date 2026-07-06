'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../page.module.css';
import { cn } from "@/lib/utils";
import { Boxes } from '@/components/ui/background-boxes';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      alert('Invalid credentials');
      return;
    }
    localStorage.setItem('currentUser', JSON.stringify({ email }));
    router.push('/');
  };

  return (
    <div className={cn(styles.authContainer, "relative overflow-hidden bg-slate-950")}>
      <div className="absolute inset-0 w-full h-full z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes className="opacity-20" />
      
      <div className={cn(styles.authCard, "relative z-10 shadow-2xl backdrop-blur-sm bg-black/40")}>
        <div className={styles.aiLogo} style={{ width: '60px', height: '60px', margin: '0 auto 2rem' }}>A</div>
        <h2 className={styles.senderName} style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '2rem' }}>Welcome Back</h2>
        <form onSubmit={handleLogin} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className={styles.authBtn}>Access Vault</button>
        </form>
        <p className={styles.authFooter}>
          New to Aetheria? <Link href="/signup">Create Vault</Link>
        </p>
      </div>
    </div>
  );
}
