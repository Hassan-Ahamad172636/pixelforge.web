// src/pages/Chat.jsx
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

let socket;

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let userId = null;
  let isLoadingUser = true;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log(decoded)
      userId = decoded?.userId;
      isLoadingUser = false;
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      isLoadingUser = false;
    }
  } else {
    isLoadingUser = false;
  }

  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [conversationTitle, setConversationTitle] = useState("New Chat");
  const [puterReady, setPuterReady] = useState(false);
  const messagesEndRef = useRef(null);

  const isNewChat = conversationId === "new" || !conversationId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const checkPuter = () => {
      if (window.puter?.ai?.txt2img) {
        setPuterReady(true);
      } else {
        setTimeout(checkPuter, 1000);
      }
    };
    checkPuter();

    socket = io(import.meta.env.VITE_APP_BASE_URL);

    socket.on("connect", () => {
      socket.emit("join", {
        userId,
        conversationId: isNewChat ? null : conversationId,
      });
    });

    socket.on("conversation-loaded", ({ conversationId: cid, title, messages: saved }) => {
      setMessages(saved || []);
      setConversationTitle(title || "New Chat");
      if (isNewChat && cid) {
        navigate(`/chat/${cid}`, { replace: true });
      }
    });

    socket.on("conversations-list", (list) => {
      window.dispatchEvent(new CustomEvent("conversations-updated", { detail: list }));
    });

    socket.on("progress", (data) => {
      setStatusText(`Generating... ${data.percent || 0}%`);
    });

    socket.on("image", ({ imageUrl }) => {
      if (imageUrl) {
        setMessages(prev => [...prev, { image: imageUrl, fromUser: false }]);
      }
      setLoading(false);
      setStatusText("Image ready!");
    });

    socket.on("message-deleted", ({ messageIndex }) => {
      setMessages(prev => prev.filter((_, i) => i !== messageIndex));
    });

    socket.on("error", (err) => {
      alert(err.message || "Error occurred");
      setLoading(false);
      setStatusText("");
    });

    return () => socket?.disconnect();
  }, [userId, conversationId, isNewChat, navigate]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading || !puterReady) return;

    const userPrompt = prompt.trim();
    setPrompt("");
    setLoading(true);
    setStatusText("Generating with FLUX.1...");

    setMessages(prev => [...prev, { text: userPrompt, fromUser: true }]);
    socket.emit("prompt", { text: userPrompt });

    try {
      const img = await window.puter.ai.txt2img(userPrompt, {
        model: "black-forest-labs/FLUX.1-schnell",
        quality: "hd",
        size: "1024x1024",
      });

      if (!img?.src) throw new Error("No image generated");

      socket.emit("generation-done", {
        imageUrl: img.src,
        prompt: userPrompt
      });

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: "Generation failed", fromUser: false }]);
      setLoading(false);
      setStatusText("");
    }
  };

  const handleDeleteMessage = (index) => {
    if (!window.confirm("Delete this image?")) return;

    setMessages(prev => prev.filter((_, i) => i !== index));

    socket.emit("delete-message", {
      conversationId: conversationId === "new" ? socket.conversationId : conversationId,
      messageIndex: index
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      {/* <div className="p-4 bg-gradient-to-r from-teal-600 to-cyan-700 shadow-lg">
        <h1 className="text-center text-xl font-bold truncate">{conversationTitle}</h1>
        {statusText && <p className="text-center text-sm mt-1">{statusText}</p>}
      </div> */}

      {/* Messages */}
      {/* Messages Area with Shimmer Loading */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.length === 0 && !loading ? (
          <div className="text-center text-gray-400 mt-20 text-lg">
            Start generating beautiful images with FLUX.1
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.fromUser ? "justify-end" : "justify-start"} group`}
              >
                <div className="max-w-sm">
                  <div className={`rounded-2xl overflow-hidden shadow-2xl ${msg.fromUser ? "bg-teal-600" : "bg-gray-800 border border-gray-700"}`}>
                    {/* User Prompt */}
                    {msg.text && (
                      <div className="p-5">
                        <p className="text-base text-white">{msg.text}</p>
                      </div>
                    )}

                    {/* AI Image */}
                    {msg.image && (
                      <div className="relative bg-black">
                        <img
                          src={msg.image}
                          alt="Generated by FLUX.1"
                          className="w-full h-auto object-contain animate-fadeIn"
                          style={{ maxHeight: "500px" }}
                        />

                        {/* Hover Actions */}
                        {!msg.fromUser && (
                          <>
                            <button
                              onClick={() => handleDeleteMessage(i)}
                              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
                              title="Delete Image"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>

                            <a
                              href={msg.image}
                              download={`flux-${Date.now()}.png`}
                              className="absolute bottom-4 right-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
                              title="Download"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* SHIMMER LOADING SKELETON WHEN GENERATING */}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-sm w-full">
                  <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-800 border border-gray-700">
                    {/* Prompt Text Skeleton */}
                    <div className="p-5 bg-gray-900/50">
                      <div className="h-5 bg-gray-700 rounded-lg w-3/4 animate-pulse"></div>
                    </div>

                    {/* Image Shimmer Skeleton */}
                    <div className="relative bg-black">
                      <div className="w-full h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/10 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>

                      {/* Floating Status Text */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="inline-flex items-center gap-3 bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-teal-500/50 shadow-2xl">
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"></div>
                              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <p className="text-teal-300 font-medium text-lg">
                              {statusText || "Generating your masterpiece with FLUX.1..."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Gradient Border Animation */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 rounded-2xl blur-lg opacity-70 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-4 max-w-5xl mx-auto">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleGenerate()}
            placeholder="Describe your image... (e.g., cyberpunk city at night)"
            className="flex-1 px-6 py-4 bg-gray-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500 text-white placeholder-gray-400 text-lg"
            disabled={loading || !puterReady}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || !puterReady}
            className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all ${loading || !prompt.trim() || !puterReady
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-teal-500 to-cyan-600 hover:shadow-2xl transform hover:scale-105"
              }`}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}