// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_APP_BASE_URL || "http://localhost:5000";

export default function Sidebar() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const token = localStorage.getItem("token");

  const fetchConversations = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/conversation/list`, {  // ← /api/ add kiya
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (result.success && result.data?.conversations) {
        // ← YEH CORRECT PATH HAI
        setConversations(result.data.conversations);
      } else {
        console.log("No conversations or failed:", result);
        setConversations([]);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [conversationId]);

  const handleNewChat = () => {
    navigate("/chat/new");
  };

  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this entire chat? This cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/conversation/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (conversationId === id) {
          navigate("/chat/new");
        }
      } else {
        const error = await res.json();
        alert(error.message || "Failed to delete");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-72 bg-gray-950 border-r border-teal-900/30 flex flex-col h-screen">
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 text-white shadow-lg"
        >
          <MessageSquarePlus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="text-xs font-bold text-teal-400 uppercase tracking-wider px-3 py-2">
          Your Chats
        </p>

        {loading ? (
          <p className="text-gray-500 text-center mt-10 text-sm">Loading chats...</p>
        ) : conversations.length === 0 ? (
          <p className="text-gray-500 text-center mt-10 text-sm italic">
            No chats yet. Start generating!
          </p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  conv.id === conversationId
                    ? "bg-teal-900/70 border-teal-600 shadow-xl shadow-teal-900/20"
                    : "hover:bg-gray-800/70 border-transparent hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-10">
                    <p className="text-sm font-medium text-white truncate">
                      {conv.title || "Untitled Chat"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="p-2 bg-red-600/90 hover:bg-red-600 rounded-lg transition-all hover:scale-110"
                    title="Delete chat"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <Button onClick={logout} className="w-full bg-red-700/50 hover:bg-red-700/60">
          Logout
        </Button>
      </div>
    </div>
  );
}