'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Plus, Lightbulb, Paperclip, Image, FileCode,
  ChevronDown, Check, Sparkles, Zap, Brain, Bolt, Github,
  SendHorizontal
} from 'lucide-react'

// TYPES
interface Model {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  badge?: string
  iconColor?: string
}

// FIGMA ICON
function FigmaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M8 24C10.208 24 12 22.208 12 20V16H8C5.792 16 4 17.792 4 20C4 22.208 5.792 24 8 24Z" fill="currentColor" />
      <path d="M4 12C4 9.792 5.792 8 8 8H12V16H8C5.792 16 4 14.208 4 12Z" fill="currentColor" />
      <path d="M4 4C4 1.792 5.792 0 8 0H12V8H8C5.792 8 4 6.208 4 4Z" fill="currentColor" />
      <path d="M12 0H16C18.208 0 20 1.792 20 4C20 6.208 18.208 8 16 8H12V0Z" fill="currentColor" />
      <path d="M20 12C20 14.208 18.208 16 16 16C13.792 16 12 14.208 12 12C12 9.792 13.792 8 16 8C18.208 8 20 9.792 20 12Z" fill="currentColor" />
    </svg>
  )
}

// MODEL SELECTOR
const models: Model[] = [
  { id: 'llama3:latest', name: 'Llama 3 (Fast)', description: 'Fastest local model', icon: <Zap className="size-4" />, iconColor: 'text-blue-400' },
  { id: 'llava:latest', name: 'Llava (Vision)', description: 'Multimodal vision model', icon: <Image className="size-4" />, iconColor: 'text-purple-400' },
  { id: 'mistral:latest', name: 'Mistral', description: 'High performance small model', icon: <Brain className="size-4" />, iconColor: 'text-emerald-400' },
  { id: 'phi3:latest', name: 'Phi-3 (Lightweight)', description: 'Ultra-fast lightweight model', icon: <Sparkles className="size-4" />, iconColor: 'text-cyan-400' }
]

function ModelSelector({ selectedModel = 'sonnet-4.5', onModelChange }: {
  selectedModel?: string
  onModelChange?: (model: Model) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(models.find(m => m.id === selectedModel) || models[0])

  const handleSelect = (model: Model) => {
    setSelected(model)
    setIsOpen(false)
    onModelChange?.(model)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95"
      >
        <span className={selected.iconColor}>{selected.icon}</span>
        <span>{selected.name}</span>
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[220px] bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-1.5">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f]">
                Select Model
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${selected.id === model.id ? 'bg-white/10 text-white' : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <div className={`flex-shrink-0 ${model.iconColor}`}>{model.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      {model.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${model.badge === 'Pro' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6a6a6f]">{model.description}</span>
                  </div>
                  {selected.id === model.id && <Check className="size-4 text-blue-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// CHAT INPUT
function ChatInput({ onSend, onUploadClick, onMicClick, isListening, placeholder = "What do you want to build?", value = "", onChange = () => { }, selectedModel, onModelChange, sources = [] }: {
  onSend?: (message: string) => void
  onUploadClick?: () => void
  onMicClick?: () => void
  isListening?: boolean
  placeholder?: string
  value?: string
  onChange?: (val: string) => void
  selectedModel?: string
  onModelChange?: (modelId: string) => void
  sources?: string[]
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [value])

  const handleSubmit = () => {
    if (value.trim()) {
      onSend?.(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
      <div className="relative rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_20px_rgba(0,0,0,0.4)]">
        {sources.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] flex-shrink-0">Source:</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {sources.map((file, i) => (
                <span key={i} className="whitespace-nowrap text-[10px] text-[#8a8a8f] bg-white/5 px-2 py-0.5 rounded-md border border-white/5 flex items-center gap-1">
                  <Paperclip className="size-2.5" />
                  {file}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-[15px] text-white placeholder-[#5a5a5f] px-5 pt-5 pb-3 focus:outline-none min-h-[80px] max-h-[200px]"
            style={{ height: '80px' }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={onUploadClick}
                className="flex items-center justify-center size-8 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-[#8a8a8f] hover:text-white transition-all duration-200 active:scale-95"
              >
                <Plus className={`size-4 transition-transform duration-200`} />
              </button>
            </div>
            <ModelSelector selectedModel={selectedModel} onModelChange={(m) => onModelChange?.(m.id)} />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={onMicClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-[#6a6a6f] hover:text-white hover:bg-white/5'}`}
            >
              <Zap className={`size-4 ${isListening ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#d4af37] hover:bg-[#c4a137] text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              <span className="hidden sm:inline">Build now</span>
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Ray Background
function RayBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-[#0f0f0f]" />
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[4000px] h-[1800px] sm:w-[6000px]"
        style={{
          background: `radial-gradient(circle at center 800px, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.15) 14%, rgba(212, 175, 55, 0.08) 18%, rgba(212, 175, 55, 0.04) 22%, rgba(17, 17, 20, 0.2) 25%)`
        }}
      />
      <div
        className="absolute top-[175px] left-1/2 w-[1600px] h-[1600px] sm:top-1/2 sm:w-[3043px] sm:h-[2865px]"
        style={{ transform: 'translate(-50%) rotate(180deg)' }}
      >
        <div className="absolute w-full h-full rounded-full -mt-[13px]" style={{ background: 'radial-gradient(43.89% 25.74% at 50.02% 97.24%, #111114 0%, #0f0f0f 100%)', border: '16px solid white', transform: 'rotate(180deg)', zIndex: 5 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f] -mt-[11px]" style={{ border: '23px solid #d4af37', transform: 'rotate(180deg)', zIndex: 4, opacity: 0.3 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f] -mt-[8px]" style={{ border: '23px solid #d4af37', transform: 'rotate(180deg)', zIndex: 3, opacity: 0.2 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f] -mt-[4px]" style={{ border: '23px solid #d4af37', transform: 'rotate(180deg)', zIndex: 2, opacity: 0.1 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f]" style={{ border: '20px solid #d4af37', boxShadow: '0 -15px 24.8px rgba(212, 175, 55, 0.3)', transform: 'rotate(180deg)', zIndex: 1 }} />
      </div>
    </div>
  )
}

// ANNOUNCEMENT BADGE COMPONENT
function AnnouncementBadge({ text, href = "#" }: { text: string; href?: string }) {
  const content = (
    <>
      <span className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none opacity-70 mix-blend-overlay" style={{ background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.15) 0%, transparent 70%)' }} />
      <span className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-[100px] opacity-60" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.8) 20%, rgba(126, 93, 225, 0.8) 50%, rgba(212, 175, 55, 0.8) 80%, transparent 100%)', filter: 'blur(0.5px)' }} />
      <Bolt className="size-4 relative z-10 text-white" />
      <span className="relative z-10 text-white font-medium">{text}</span>
    </>
  )

  const className = "relative inline-flex items-center gap-2 px-5 py-2 min-h-[40px] rounded-full text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
  const style = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    backdropFilter: 'blur(20px) saturate(140%)',
    boxShadow: 'inset 0 1px rgba(255,255,255,0.2), inset 0 -1px rgba(0,0,0,0.1), 0 8px 32px -8px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.08)'
  }

  return href !== '#' ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>{content}</a>
  ) : (
    <button className={className} style={style}>{content}</button>
  )
}

// IMPORT BUTTONS COMPONENT
function ImportButtons({ onImport }: { onImport?: (source: string) => void }) {
  return (
    <div className="flex items-center gap-4 justify-center">
      <span className="text-sm text-[#6a6a6f]">or import from</span>
      <div className="flex gap-2">
        {[
          { id: 'figma', name: 'Figma', icon: <FigmaIcon className="size-4" /> },
          { id: 'github', name: 'GitHub', icon: <Github className="size-4" /> }
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => onImport?.(option.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-[#0f0f0f] hover:bg-[#1a1a1e] text-[#8a8a8f] hover:text-white transition-all duration-200 active:scale-95"
          >
            {option.icon}
            <span>{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// MAIN BOLT CHAT COMPONENT
interface BoltChatProps {
  title?: string
  subtitle?: string
  announcementText?: string
  announcementHref?: string
  placeholder?: string
  onSend?: (message: string) => void
  onUploadClick?: () => void
  onMicClick?: () => void
  isListening?: boolean
  selectedModel?: string
  onModelChange?: (modelId: string) => void
  input?: string
  onInputChange?: (val: string) => void
  sources?: string[]
}

export function BoltStyleChat({
  title = "What will you",
  subtitle = "Experience private, professional AI assistance, locally with Aetheria.",
  announcementText = "Introducing Aetheria V2",
  announcementHref = "#",
  placeholder = "What do you want to build?",
  onSend,
  onUploadClick,
  onMicClick,
  isListening,
  selectedModel,
  onModelChange,
  input,
  onInputChange,
  sources = []
}: BoltChatProps) {
  const hasHeader = title || subtitle;
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100%] w-full bg-[#0f0f0f] rounded-3xl">
      <RayBackground />
      <div className="absolute top-[40px]">
        <AnnouncementBadge text={announcementText} href={announcementHref} />
      </div>
      <div className={`flex flex-col items-center justify-center w-full ${hasHeader ? 'h-full' : ''} px-4 z-10`}>
        {hasHeader && (
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-1">
              {title}{' '}
              <span className="bg-gradient-to-b from-[#d4af37] via-[#d4af37] to-white bg-clip-text text-transparent italic">
                build
              </span>
              {' '}today?
            </h1>
            <p className="text-base font-semibold sm:text-lg text-[#8a8a8f]">{subtitle}</p>
          </div>
        )}

        <div className="w-full max-w-[700px] mb-6 sm:mb-8 mt-2">
          <ChatInput
            placeholder={placeholder}
            onSend={onSend}
            onUploadClick={onUploadClick}
            onMicClick={onMicClick}
            isListening={isListening}
            value={input}
            onChange={onInputChange}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            sources={sources}
          />
        </div>
      </div>
    </div>
  )
}
