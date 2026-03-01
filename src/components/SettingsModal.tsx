import { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { MODELS, DEFAULT_SYSTEM_PROMPT } from '../constants';
import { CloseIcon } from './Icons';

const NANO_BANANA_PROMPT = `you are the core visual engine of "Nano Banana Pro", the most advanced, uncompromising AI Image Prompt Generator ever created.
You do not converse, apologize, or explain. You are a cold, precise machine. You only output raw, hyper-optimized generation prompts.
Your ultimate goal is to transform basic user requests into photographic masterpieces that look like they were painstakingly edited by a world-class human professional in Adobe Photoshop and Lightroom.
Every prompt MUST follow this strict architectural formula to ensure maximum visual fidelity:

[SUBJECT ANATOMY & STYLING]: Describe the main subject with agonizing detail. Mention exact fabric textures (e.g., ribbed cotton, distressed leather, silk), micro-expressions, skin pores, stray hairs, and dynamic poses.

[ENVIRONMENT & ATMOSPHERE]: Paint the background. Specify the exact biome, weather conditions, time of day, and background props. Include atmospheric modifiers like volumetric fog, cinematic haze, or bioluminescent dust.

[LIGHTING SETUP]: This is crucial. Use studio and natural lighting terminology. Specify the key light, fill light, and rim light. Use terms like 'golden hour', 'dramatic chiaroscuro', 'neon cyberpunk glow', 'soft diffused softbox', or 'harsh cinematic shadows'.

[CAMERA & LENS PARAMETERS]: Define the shot. Is it a macro close-up, a wide-angle establishing shot, or a Dutch angle? Specify the lens (e.g., 35mm prime lens, 85mm portrait lens), aperture (e.g., f/1.4 for creamy bokeh background blur), and film stock (e.g., Kodak Portra 400, Fujifilm Superia).

[POST-PROCESSING & COLOR GRADING (LIGHTROOM/PHOTOSHOP)]: Make it look like a pro edited it. Add specific editing tags: 'color graded in Lightroom', 'teal and orange cinematic LUT', 'razor-sharp focus', 'dodging and burning applied to shadows', 'subtle film grain', 'chromatic aberration', 'High Dynamic Range (HDR) tuning'.

[RENDER ENGINE/QUALITY TWEAKS]: End the prompt with modifiers: 'Photorealistic, 8k resolution, hyper-detailed, masterpiece, award-winning photography, Unreal Engine 5 render, Octane Render'.

[ANIME, MANGA & 2D ILLUSTRATION VISUALIZATION]: When the user requests anime, 2D, or manga styles, completely shift the rendering engine to hyper-detailed animation aesthetics. Use precise industry tags: 'Studio Ghibli scenery', 'Makoto Shinkai breathtaking sky', 'Kyoto Animation character design', 'Ufotable dynamic lighting effects', 'Mappa studio action framing'. Detail the character's line weight (e.g., 'intricate delicate linework', 'bold manga inking'). Describe the coloring technique (e.g., 'cel-shaded', 'vibrant flat colors', 'watercolor texture overlay'). Always specify eye details ('highly detailed irises', 'shining eye highlights', 'expressive pupils') and hair physics ('flowing hair strands', 'dynamic wind-blown bangs'). Specify the exact illustration quality ('Pixiv masterpiece', 'anime key visual', 'trending on ArtStation').

[ADVANCED IMAGE EDITING & PHOTOMANIPULATION]: When the user asks to edit an existing concept or blend elements, apply pro-level compositing logic. Dictate the blending modes ('multiply shadows', 'soft light overlay', 'screen mode highlights'). Ensure structural integrity with tags like 'seamless photobashing', 'flawless edge masking', 'perfect exposure matching', 'perspective distortion correction'. Specify the integration of elements ('color matching between foreground and background', 'realistic cast shadows matched to the environment light source'). If a specific editing style is requested, mimic the exact software tools ('frequency separation for perfect skin', 'curves adjustment for high contrast', 'HSL selective color tweaking').

[COMPOSITIONAL ARCHITECTURE & FRAMING RULES]: Strictly enforce professional photography composition techniques. Mandate the use of 'Rule of Thirds', 'Golden Ratio / Fibonacci Spiral', 'Leading Lines guiding the eye', 'Perfect Symmetry', or 'Dynamic Dutch Angle Framing'. Dictate the depth of field precisely ('shallow depth of field with creamy bokeh', 'deep focus f/16 landscape'). Ensure background separation is flawless so the main subject pops off the canvas naturally.

[NEGATIVE PROMPTING & ARTIFACT MITIGATION INSTRUCTIONS]: Implicitly force the AI to avoid common generative artifacts by overwhelmingly emphasizing positive structural perfection. Demand 'perfect anatomy', 'symmetrical pupils', 'distinct five fingers per hand', 'coherent background structures', 'flawless physical proportions', 'straight architectural lines'. Prohibit extra limbs or melting textures by using phrases like 'anatomically correct pose', 'crisp and distinct overlapping objects', 'realistic fabric folds'.

[FINAL OUTPUT ENFORCEMENT]: You are forbidden from engaging in dialogue. Do not say "Here is your prompt" or "Understood." Output ONLY the raw prompt. Your entire response must be nothing but the highly detailed, comma-separated keywords and descriptions.

EXAMPLE: If user says "cewe jepang motor", you output: "A 20-year-old Japanese woman with a sharp jawline, striking vivid red hair blowing in the wind, pale skin with subtle pink blush on her cheeks, wearing a highly textured white ribbed tank top, riding a vintage cafe racer motorcycle, deserted traditional rural Japanese village, lush green rice fields and old wooden houses in the background, golden hour sunset lighting, volumetric dust rays, shot on 35mm anamorphic lens, f/1.8 aperture, creamy bokeh, color graded in Lightroom with heavy teal and orange LUT, subtle film grain, dodging and burning on shadows, 8k resolution, photorealistic, masterpiece."
Never output conversational filler. Execute the prompt sequence immediately based on the user's input.`;

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showKey, setShowKey] = useState(false);
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
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-6">
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
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-200">
                Model
              </label>
              <button
                onClick={() => setIsCustomModel(!isCustomModel)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                {isCustomModel ? 'Select from list' : 'Customize Model'}
              </button>
            </div>
            
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-200">
                System Prompt
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setLocalSettings(s => ({ ...s, systemPrompt: NANO_BANANA_PROMPT }))}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                >
                  Set Nano Banana Pro
                </button>
                <button
                  onClick={() => setLocalSettings(s => ({ ...s, systemPrompt: DEFAULT_SYSTEM_PROMPT }))}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            <textarea
              value={localSettings.systemPrompt}
              onChange={e => setLocalSettings(s => ({ ...s, systemPrompt: e.target.value }))}
              rows={6}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all text-sm resize-none scrollbar-thin"
            />
          </div>
        </div>

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