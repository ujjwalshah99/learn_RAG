"use client";

import { useState, useRef, FormEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    // TODO: send file to backend
    const formData = new FormData();
    formData.append('pdf' , file);
    await fetch("http://localhost:8000/upload/pdf" , {
      method: 'POST' , 
      body : formData
    })
    console.log("file uploaded")
    setUploaded(true);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // TODO: call backend chat API
    const assistantMsg: Message = {
      role: "assistant",
      content: "This is a placeholder response. Connect your backend API here.",
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] p-4 max-w-3xl mx-auto">
      {!uploaded ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-6 w-full">
          <h1 className="text-2xl font-semibold">Upload a file to chat with it</h1>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-400 rounded-xl p-10 w-full max-w-md text-center cursor-pointer hover:border-[#6c47ff] transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md,.csv,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="text-sm">{file.name}</p>
            ) : (
              <p className="text-gray-500">Click to select a file (.pdf, .txt, .md, .csv, .docx)</p>
            )}
          </div>
          <button
            onClick={handleUpload}
            disabled={!file}
            className="bg-[#6c47ff] text-white rounded-lg px-6 py-2 font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 w-full">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Chatting with: {file?.name}</p>
            <button
              onClick={() => {
                setUploaded(false);
                setFile(null);
                setMessages([]);
              }}
              className="text-sm text-[#6c47ff] cursor-pointer hover:underline"
            >
              Upload new file
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.length === 0 && (
              <p className="text-gray-400 text-center mt-20">Ask anything about your file</p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-[#6c47ff] text-white ml-auto"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="bg-gray-100 text-gray-500 rounded-lg px-4 py-2 max-w-[80%]">
                Thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#6c47ff]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#6c47ff] text-white rounded-lg px-5 py-2 font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
