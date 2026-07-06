'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../page.module.css';
import { Boxes } from '@/components/ui/background-boxes';
import { cn } from "@/lib/utils";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      alert('User already exists');
      return;
    }
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({ email }));
    router.push('/');
  };

  return (
    <div className={cn(styles.authContainer, "relative overflow-hidden bg-slate-950")}>
      <div className="absolute inset-0 w-full h-full z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes className="opacity-20" />
      
      <div className={cn(styles.authCard, "relative z-10 shadow-2xl backdrop-blur-sm bg-black/40")}>
        <div className={styles.aiLogo} style={{ width: '60px', height: '60px', margin: '0 auto 2rem' }}>A</div>
        <h2 className={styles.senderName} style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '2rem' }}>Create Account</h2>
        <form onSubmit={handleSignup} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com"
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Master Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className={styles.authBtn}>Sign Up</button>
        </form>
        <p className={styles.authFooter}>
          Already have an account? <Link href="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
