// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquarePlus, Trash2, Edit2 } from "lucide-react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";

// Socket ko ek baar banao aur reuse karo
const socket = io(import.meta.env.VITE_APP_BASE_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
});

export default function Sidebar() {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const { conversationId } = useParams();

  function logout() {
    localStorage.clear();
    navigate('/')
  }
  
  useEffect(() => {
    // Custom event se list update karo (join se aata hai)
    const updateHandler = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setConversations(e.detail);
      }
    };
    window.addEventListener("conversations-updated", updateHandler);

    // Delete event
    socket.on("conversation-deleted", ({ deletedId }) => {
      setConversations((prev) => prev.filter((c) => c.id !== deletedId));
      if (conversationId === deletedId) {
        navigate("/chat/new");
      }
    });

    // Rename/Delete ke baad list refresh
    socket.on("conversations-updated", () => {
      // Server se latest list maango
      socket.emit("request-conversations");
    });

    // Latest conversations list receive karo
    socket.on("conversations-list", (list) => {
      setConversations(list);
    });

    // Cleanup
    return () => {
      window.removeEventListener("conversations-updated", updateHandler);
      socket.off("conversation-deleted");
      socket.off("conversations-updated");
      socket.off("conversations-list");
    };
  }, [conversationId, navigate]);

  const handleNewChat = () => {
    navigate("/chat/new");
  };

  const handleDeleteConversation = (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this entire chat? This cannot be undone.")) return;

    setConversations((prev) => prev.filter((c) => c.id !== id));
    socket.emit("delete-conversation", { conversationId: id });

    if (conversationId === id) {
      navigate("/chat/new");
    }
  };

  const handleRenameConversation = (id, currentTitle, e) => {
    e.stopPropagation();
    const newTitle = window.prompt("Enter new chat name:", currentTitle);
    if (newTitle && newTitle.trim() && newTitle.trim() !== currentTitle) {
      socket.emit("rename-conversation", {
        conversationId: id,
        title: newTitle.trim(),
      });
    }
  };

  return (
    <div className="w-72 bg-gray-950 border-r border-teal-900/30 flex flex-col h-screen">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 text-white shadow-lg"
        >
          <MessageSquarePlus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="text-xs font-bold text-teal-400 uppercase tracking-wider px-3 py-2">
          Your Chats
        </p>

        {conversations.length === 0 ? (
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
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* <button
                    onClick={(e) => handleRenameConversation(conv.id, conv.title, e)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all hover:scale-110"
                    title="Rename chat"
                  >
                    <Edit2 className="w-4 h-4 text-gray-300" />
                  </button> */}
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="cursor-pointer p-2 bg-red-600/90 hover:bg-red-600 rounded-lg transition-all hover:scale-110"
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

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        {/* <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/70 transition cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            U
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Free User</p>
            <p className="text-xs text-teal-400">Unlimited FLUX.1</p>
          </div>
        </div> */}
        <Button onClick={logout} className={'bg-red-700/50 w-full hover:bg-red-700/60'}>Logout</Button>
      </div>
    </div>
  );
}