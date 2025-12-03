// src/pages/Chat.jsx
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_APP_BASE_URL || "http://localhost:5000";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded?.userId;
    } catch (err) {
      localStorage.removeItem("token");
    }
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

  // Check Puter AI ready
  useEffect(() => {
    const checkPuter = () => {
      if (window.puter?.ai?.txt2img) {
        setPuterReady(true);
      } else {
        setTimeout(checkPuter, 1000);
      }
    };
    checkPuter();
  }, []);

  // Load Conversation on Mount
  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const loadConversation = async () => {
      try {
        const res = await fetch(`${API_BASE}/conversation/${isNewChat ? "new" : conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
          setMessages(data?.data?.messages || []);
          setConversationTitle(data?.data?.title || "New Chat");
          if (isNewChat && data.data?._id) {
            navigate(`/chat/${data.data?._id}`, { replace: true });
          }
        }
      } catch (err) {
        console.log(err)
        alert("Failed to load conversation");
      }
    };

    loadConversation();
  }, [userId, conversationId, isNewChat, navigate, token]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading || !puterReady) return;

    const userPrompt = prompt.trim();
    setPrompt("");
    setLoading(true);
    setStatusText("Generating with FLUX.1...");

    // Add user message
    setMessages(prev => [...prev, { text: userPrompt, fromUser: true }]);

    // Save prompt to backend
    try {
      await fetch(`${API_BASE}/conversation/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: conversationId === "new" ? null : conversationId,
          text: userPrompt
        })
      });
    } catch (err) {
      console.error("Failed to save prompt");
    }

    try {
      const img = await window.puter.ai.txt2img(userPrompt, {
        model: "black-forest-labs/FLUX.1-schnell",
        quality: "hd",
        size: "1024x1024",
      });

      if (!img?.src) throw new Error("No image");

      // Send image to backend
      const res = await fetch(`${API_BASE}/conversation/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: conversationId === "new" ? null : conversationId,
          imageUrl: img.src,
          prompt: userPrompt
        })
      });

      const result = await res.json();
      if (result.success) {
        setMessages(prev => [...prev, {
          text: userPrompt,
          image: img.src,
          fromUser: false
        }]);
        setConversationTitle(result.title || conversationTitle);
        if (isNewChat && result.conversationId) {
          navigate(`/chat/${result.conversationId}`, { replace: true });
        }
      }

      setLoading(false);
      setStatusText("Image ready!");
    } catch (err) {
      setMessages(prev => [...prev, { text: "Generation failed", fromUser: false }]);
      setLoading(false);
      setStatusText("");
    }
  };

  const handleDeleteMessage = async (index) => {
    if (!window.confirm("Delete this image?")) return;

    setMessages(prev => prev.filter((_, i) => i !== index));

    await fetch(`${API_BASE}/conversation/message/${index}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        conversationId: conversationId === "new" ? null : conversationId
      })
    });
  };

  // Rest of your JSX remains SAME (beautiful UI)
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.length === 0 && !loading ? (
          <div className="text-center text-gray-400 mt-20 text-lg">
            Start generating beautiful images with FLUX.1
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.fromUser ? "justify-end" : "justify-start"} group`}>
                <div className="max-w-sm">
                  <div className={`rounded-2xl overflow-hidden shadow-2xl ${msg.fromUser ? "bg-teal-600" : "bg-gray-800 border border-gray-700"}`}>
                    {msg.text && <div className="p-5"><p className="text-base text-white">{msg.text}</p></div>}
                    {msg.image && (
                      <div className="relative bg-black">
                        <img src={msg.image} alt="Generated" className="w-full h-auto object-contain" style={{ maxHeight: "500px" }} />
                        {!msg.fromUser && (
                          <>
                            <button onClick={() => handleDeleteMessage(i)} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <a href={msg.image} download={`flux-${Date.now()}.png`} className="absolute bottom-4 right-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </a>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-sm w-full">
                  <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-800 border border-gray-700">
                    <div className="p-5 bg-gray-900/50"><div className="h-5 bg-gray-700 rounded-lg w-3/4 animate-pulse"></div></div>
                    <div className="relative bg-black">
                      <div className="w-full h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/10 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="inline-flex items-center gap-3 bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-teal-500/50 shadow-2xl">
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"></div>
                              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <p className="text-teal-300 font-medium text-lg">{statusText}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

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
            className={`px-12 py-4 rounded--2xl font-bold text-lg transition-all ${(loading || !prompt.trim() || !puterReady) ? "bg-gray-700 cursor-not-allowed" : "bg-gradient-to-r from-teal-500 to-cyan-600 hover:shadow-2xl transform hover:scale-105"}`}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}