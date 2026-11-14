"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { HELP_ENTRIES, SUPPORT_EMAIL, type HelpEntry } from "@/content/helpKnowledge";
import { answerQuestion, suggestionsAfter } from "@/lib/help/matchHelp";

interface Message {
  readonly id: number;
  readonly from: "bot" | "user";
  readonly text: string;
}

const GREETING = "Hi, I'm the SoulNest help assistant. Pick a question below, or type your own.";

const CHIP =
  "shrink-0 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white";

/** Thin, subtle scrollbar so it doesn't dominate the small chat window. */
const THIN_SCROLL = "[scrollbar-width:thin] [scrollbar-color:rgba(181,245,218,0.35)_transparent]";

const INITIAL_SUGGESTIONS = HELP_ENTRIES.filter((entry) => entry.id !== "crisis").slice(0, 5);

/** Floating help chat with suggested questions. Answers come from a fixed set, so it can't invent policies. */
export function HelpChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: GREETING }]);
  const [suggestions, setSuggestions] = useState<HelpEntry[]>(INITIAL_SUGGESTIONS);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function ask(question: string, shownAs?: string): void {
    const trimmed = question.trim();
    if (!trimmed) return;

    const { answer, matched } = answerQuestion(trimmed);
    const userMessage: Message = { id: nextId.current++, from: "user", text: shownAs ?? trimmed };
    const botMessage: Message = { id: nextId.current++, from: "bot", text: answer };

    setMessages((current) => [...current, userMessage, botMessage]);
    setSuggestions(suggestionsAfter(matched));
    setDraft("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    ask(draft);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={titleId}
        aria-label={isOpen ? "Close help" : "Open help chat"}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#c9f7e3] to-[#cfeaff] text-[#2a1f4a] shadow-2xl transition hover:-translate-y-0.5 hover:shadow-[0_15px_40px_-10px_rgba(181,245,218,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {isOpen ? (
        <section
          id={titleId}
          aria-labelledby={`${titleId}-title`}
          className="fixed bottom-24 right-5 z-40 flex max-h-[calc(100dvh-8rem)] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#241a40] shadow-2xl"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 id={`${titleId}-title`} className="font-serif text-lg text-white">
              SoulNest help
            </h2>
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">Quick answers</span>
          </header>

          <div
            ref={listRef}
            className={`min-h-40 flex-1 space-y-3 overflow-y-auto px-4 py-4 ${THIN_SCROLL}`}
            role="log"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    message.from === "user"
                      ? "rounded-br-sm bg-[#b5f5da] text-[#2a1f4a]"
                      : "rounded-tl-sm bg-white/10 text-white/90"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-white/10 px-4 py-3">
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/40">Suggested questions</p>
            <div className={`flex snap-x gap-2 overflow-x-auto pb-2 ${THIN_SCROLL}`}>
              {suggestions.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => ask(entry.question, entry.question)}
                  className={`${CHIP} snap-start`}
                >
                  {entry.question}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-white/5 p-3">
            <label htmlFor={`${titleId}-input`} className="sr-only">
              Type your question
            </label>
            <input
              id={`${titleId}-input`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={300}
              placeholder="Type your question..."
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus-visible:outline-2 focus-visible:outline-white"
            />
            <button
              type="submit"
              disabled={draft.trim().length === 0}
              aria-label="Send question"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c9f7e3] text-[#2a1f4a] transition hover:scale-105 disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <p className="shrink-0 px-4 pb-3 text-[11px] text-white/35">Need a person? Email {SUPPORT_EMAIL}</p>
        </section>
      ) : null}
    </>
  );
}   