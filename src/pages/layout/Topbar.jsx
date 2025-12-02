import React, { useState } from 'react';
import { Sparkles, Settings, User, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Topbar() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className="border-b border-teal-500/20 bg-transparent backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        {/* Left Section - Logo and Title */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Pixel Forge AI
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Powered by advanced AI</p>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          {/* <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-teal-500/20"> */}
            {/* <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div> */}
            {/* <span className="text-sm text-slate-300">GPT-4</span> */}
          {/* </div>/ */}

          {/* Theme Toggle */}
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="text-slate-400 hover:text-teal-400 hover:bg-slate-800/50 transition-all duration-200"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button> */}

          {/* Settings */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-teal-400 hover:bg-slate-800/50 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </Button> */}

          {/* User Profile */}
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-teal-500/20 ring-2 ring-transparent group-hover:ring-teal-400/50 transition-all duration-200">
              <User className="w-5 h-5" />
            </div>
            
            {/* Dropdown indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>

      {/* Optional: Status Bar */}
      {/* <div className="px-4 pb-2 flex items-center gap-2 text-xs text-slate-500"> */}
        {/* <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          <span>All systems operational</span>
        </div>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">Response time: ~1.2s</span>
      </div> */}
    </div>
  );
}

export default Topbar;