import { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { MODELS, DEFAULT_SYSTEM_PROMPT } from '../constants';
import { CloseIcon } from './Icons';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  
  // [🔥] STATE BARU BUAT FITUR CUSTOM MODEL
  const [isCustomModel, setIsCustomModel] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#2d2d2d] rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={localSettings.apiKey}
                onChange={e => setLocalSettings(s => ({ ...s, apiKey: e.target.value }))}
                placeholder="sk-or-v1-..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-200">
                Model
              </label>
              {/* [🔥] TOMBOL SWITCHER CUSTOM MODEL */}
              <button
                onClick={() => setIsCustomModel(!isCustomModel)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                {isCustomModel ? 'Select from list' : 'Customize Model'}
              </button>
            </div>
            
            {/* [🔥] LOGIKA IF-ELSE BUAT NAMPILIN INPUT ATAU SELECT */}
            {isCustomModel ? (
              <input
                type="text"
                value={localSettings.model}
                onChange={e => setLocalSettings(s => ({ ...s, model: e.target.value }))}
                placeholder="please input your ai model, ex: openai/gpt-5.2"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all text-sm font-mono"
              />
            ) : (
              <select
                value={localSettings.model}
                onChange={e => setLocalSettings(s => ({ ...s, model: e.target.value }))}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all text-sm appearance-none cursor-pointer"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#2d2d2d]">
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-200">
                System Prompt
              </label>
              <button
                onClick={() => setLocalSettings(s => ({ ...s, systemPrompt: DEFAULT_SYSTEM_PROMPT }))}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>
            <textarea
              value={localSettings.systemPrompt}
              onChange={e => setLocalSettings(s => ({ ...s, systemPrompt: e.target.value }))}
              rows={4}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm bg-white text-black font-medium hover:bg-gray-200 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}