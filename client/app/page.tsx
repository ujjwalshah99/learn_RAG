"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (uploaded) inputRef.current?.focus();
  }, [uploaded]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      await fetch("http://localhost:8000/upload/pdf", {
        method: "POST",
        body: formData,
      });
      setUploaded(true);
    } catch {
      alert("Upload failed. Is the server running?");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer ?? "No response from server." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: failed to get a response. Is the server running?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") setFile(droppedFile);
  };

  if (!uploaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-lg text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chat with your PDF</h1>
            <p className="text-gray-500 mt-2">Upload a document and ask questions about it</p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all ${
              dragOver
                ? "border-[#6c47ff] bg-[#6c47ff]/5"
                : file
                ? "border-[#6c47ff] bg-[#6c47ff]/5"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="space-y-2">
                <div className="text-4xl">PDF</div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl text-gray-300">+</div>
                <p className="text-gray-500">Drop a PDF here or click to browse</p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-[#6c47ff] text-white rounded-xl px-6 py-3 font-medium text-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-[#5a38e0] transition-colors"
          >
            {uploading ? "Uploading..." : "Upload & Start Chatting"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium bg-[#6c47ff]/10 text-[#6c47ff] px-3 py-1 rounded-full">
            {file?.name}
          </span>
        </div>
        <button
          onClick={() => {
            setUploaded(false);
            setFile(null);
            setMessages([]);
          }}
          className="text-sm text-gray-500 hover:text-[#6c47ff] cursor-pointer transition-colors"
        >
          New document
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <p className="text-xl font-medium text-gray-400">Ask anything about your document</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {["Summarize this document", "What are the key points?", "What is this about?"].map(
                (q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-sm border border-gray-200 rounded-full px-4 py-2 text-gray-600 hover:border-[#6c47ff] hover:text-[#6c47ff] cursor-pointer transition-colors"
                  >
                    {q}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#6c47ff] text-white rounded-br-md"
                  : "bg-gray-100 text-gray-900 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#6c47ff] focus:ring-1 focus:ring-[#6c47ff]/20 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#6c47ff] text-white rounded-xl px-5 py-3 font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-[#5a38e0] transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
