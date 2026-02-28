export function PlusIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function SendIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export function ArrowUpIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export function StopIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

export function SidebarIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

export function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function SettingsIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export function EditIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function ChatBubbleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function CopyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ChevronDownIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function CloseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function SparklesIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
    </svg>
  );
}

export function UserIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export function GPTIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5">
      <path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.6294 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500929C16.1708 0.495035 14.0893 1.16498 12.3614 2.41568C10.6335 3.66638 9.34853 5.43747 8.69455 7.47815C7.30225 7.76286 5.98879 8.3414 4.8377 9.17505C3.68661 10.0087 2.72528 11.0782 2.01816 12.3124C0.964925 14.1591 0.480875 16.2694 0.626435 18.3813C0.771995 20.4933 1.54071 22.5133 2.83405 24.1893C2.38555 25.5359 2.23005 26.9626 2.37775 28.3741C2.52545 29.7856 2.97295 31.1492 3.69035 32.3738C4.75375 34.2259 6.37815 35.6924 8.32905 36.5615C10.28 37.4306 12.4565 37.6574 14.5449 37.2092C15.4868 38.2707 16.6445 39.1187 17.9407 39.6966C19.2369 40.2744 20.6415 40.5687 22.0606 40.5591C24.1956 40.565 26.2771 39.895 28.005 38.6443C29.7329 37.3936 31.0178 35.6226 31.6718 33.5819C33.0641 33.2972 34.3776 32.7186 35.5287 31.885C36.6798 31.0513 37.6411 29.9818 38.3482 28.7476C39.4015 26.9009 39.8855 24.7906 39.7399 22.6787C39.5944 20.5667 38.8256 18.5467 37.5324 16.8707ZM22.0706 37.0391C20.3486 37.0441 18.6686 36.5089 17.2606 35.5065L17.5706 35.3265L25.4546 30.7725C25.6373 30.6696 25.7883 30.5186 25.8908 30.3362C25.9932 30.1537 26.0433 29.947 26.0353 29.7385V18.9075L29.4506 20.8835C29.4657 20.8918 29.4784 20.9039 29.4876 20.9186C29.4967 20.9334 29.502 20.9502 29.5031 20.9676V29.8645C29.4984 31.7648 28.7414 33.5866 27.3982 34.9298C26.0549 36.273 24.2332 37.0301 22.3328 37.0348L22.0706 37.0391ZM6.22455 31.0291C5.37055 29.5645 5.04555 27.8575 5.30155 26.1905L5.61155 26.3805L13.4956 30.9345C13.6753 31.0384 13.8793 31.0929 14.0873 31.0929C14.2953 31.0929 14.4993 31.0384 14.6791 30.9345L24.2456 25.4115V29.3695C24.2476 29.3866 24.2451 29.4039 24.2384 29.4197C24.2318 29.4355 24.2213 29.4493 24.2081 29.4597L16.2346 34.0637C14.5766 35.0194 12.634 35.3703 10.7433 35.0542C8.85253 34.7381 7.13825 33.7756 5.91555 32.3338L6.22455 31.0291ZM4.07855 13.9771C4.92255 12.5231 6.25055 11.4271 7.82555 10.8751V19.5601C7.81725 19.767 7.86365 19.9723 7.96055 20.1555C8.05745 20.3386 8.20155 20.4933 8.37855 20.6045L17.9041 26.1085L14.4886 28.0845C14.4727 28.094 14.4546 28.0993 14.4361 28.0998C14.4175 28.1003 14.3992 28.0962 14.3826 28.0877L6.40705 23.4777C4.75305 22.5179 3.54155 21.0053 2.99895 19.2255C2.45635 17.4458 2.62235 15.5266 3.46505 13.8695L4.07855 13.9771ZM31.6486 20.4555L22.0826 14.9125L25.4976 12.9365C25.5136 12.927 25.5317 12.9217 25.5502 12.9212C25.5687 12.9207 25.5871 12.9248 25.6038 12.9333L33.5793 17.5433C34.8071 18.254 35.8071 19.3036 36.4626 20.5621C37.1181 21.8205 37.4002 23.2377 37.2765 24.6505C37.1528 26.0633 36.6284 27.412 35.7639 28.5431C34.8994 29.6743 33.7312 30.5418 32.4046 31.0451V22.3601C32.4066 22.1543 32.3561 21.9514 32.258 21.7704C32.1599 21.5894 32.0174 21.4362 31.8431 21.3245L31.6486 20.4555ZM35.0036 14.8705L34.6936 14.6805L26.8096 10.1265C26.6298 10.0226 26.4259 9.96814 26.2179 9.96814C26.0099 9.96814 25.8059 10.0226 25.6261 10.1265L16.0596 15.6495V11.6915C16.0577 11.6744 16.0601 11.6571 16.0668 11.6413C16.0734 11.6255 16.084 11.6117 16.0971 11.6013L24.0726 6.99728C25.3017 6.2889 26.7038 5.93234 28.1162 5.96852C29.5285 6.0047 30.9091 6.43224 32.0982 7.20232C33.2874 7.97239 34.2386 9.05529 34.847 10.3346C35.4555 11.6138 35.6974 13.0381 35.5466 14.4475L35.0036 14.8705ZM14.2516 22.1535L10.8326 20.1735C10.8166 20.1637 10.8032 20.1501 10.7938 20.1341C10.7843 20.118 10.7791 20.1 10.7786 20.0815V11.1955C10.7813 9.77888 11.1882 8.39189 11.9525 7.19322C12.7168 5.99454 13.808 5.03237 15.0916 4.42153C16.3752 3.8107 17.8004 3.57601 19.2066 3.74387C20.6129 3.91173 21.9432 4.47532 23.0506 5.37228L22.7406 5.55228L14.8566 10.1063C14.674 10.2092 14.5229 10.3602 14.4205 10.5426C14.318 10.7251 14.268 10.9318 14.2756 11.1403L14.2516 22.1535ZM16.0476 18.3405L20.1526 16.0005L24.2576 18.3405V23.0125L20.1526 25.3525L16.0476 23.0125V18.3405Z" fill="currentColor"/>
    </svg>
  );
}

export function EllipsisIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
    </svg>
  );
}

export function SearchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function ImageIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}