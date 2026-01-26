// Project Overview Icon - Document with timeline/milestones
export function ProjectOverviewIcon() {
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-1.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 350 350"
        fill="none"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle cx="100" cy="260" r="70" fill="#F3E5F5" opacity="0.4"/>

        {/* Main document stack - back */}
        <rect x="100" y="80" width="180" height="190" rx="12" fill="#4A5568" stroke="#2D3748" strokeWidth="6"/>

        {/* Main document stack - middle */}
        <rect x="120" y="70" width="180" height="190" rx="12" fill="#5A6C7D" stroke="#4A5568" strokeWidth="6"/>

        {/* Main document - front */}
        <rect x="140" y="60" width="180" height="190" rx="12" fill="#FFFFFF" stroke="#4A5568" strokeWidth="6"/>

        {/* Flag icon */}
        <path d="M180 110 L180 150 M180 110 L220 120 L180 130 Z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Text lines */}
        <line x1="200" y1="120" x2="280" y2="120" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round"/>
        <line x1="200" y1="140" x2="260" y2="140" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round"/>
        <line x1="160" y1="170" x2="300" y2="170" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round"/>
        <line x1="160" y1="195" x2="300" y2="195" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round"/>

        {/* Timeline circles at bottom */}
        <circle cx="190" cy="225" r="12" fill="#FFFFFF" stroke="#4A5568" strokeWidth="5"/>
        <circle cx="230" cy="225" r="12" fill="#FFFFFF" stroke="#4A5568" strokeWidth="5"/>
        <circle cx="270" cy="225" r="12" fill="#FFFFFF" stroke="#4A5568" strokeWidth="5"/>
        <line x1="202" y1="225" x2="218" y2="225" stroke="#4A5568" strokeWidth="5"/>
        <line x1="242" y1="225" x2="258" y2="225" stroke="#4A5568" strokeWidth="5"/>

        {/* Small decorative dots */}
        <circle cx="175" cy="300" r="8" fill="#2D3748"/>
        <circle cx="315" cy="140" r="8" fill="#2D3748"/>
      </svg>
    </div>
  );
}

// Meeting Notes Icon - Documents with checklist and clock
export function MeetingNotesIcon() {
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-1.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 350 350"
        fill="none"
        className="w-full h-full"
      >
        {/* Background decorative circle */}
        <circle cx="60" cy="250" r="65" fill="#E8D5F0" opacity="0.5"/>

        {/* Main document stack - back */}
        <rect x="70" y="60" width="200" height="220" rx="12" fill="#4A5568" stroke="#2D3748" strokeWidth="6"/>

        {/* Main document stack - middle */}
        <rect x="90" y="50" width="200" height="220" rx="12" fill="#5A6C7D" stroke="#4A5568" strokeWidth="6"/>

        {/* Main document - front with white background */}
        <rect x="110" y="40" width="200" height="220" rx="12" fill="#FFFFFF" stroke="#4A5568" strokeWidth="6"/>

        {/* Checkbox 1 with checkmark - blue */}
        <rect x="130" y="70" width="35" height="35" rx="6" fill="#60A5FA" stroke="#3B82F6" strokeWidth="3"/>
        <path d="M140 87 L148 95 L158 80" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Text lines next to checkbox 1 */}
        <line x1="175" y1="80" x2="270" y2="80" stroke="#93C5FD" strokeWidth="6" strokeLinecap="round"/>
        <line x1="175" y1="95" x2="230" y2="95" stroke="#93C5FD" strokeWidth="6" strokeLinecap="round"/>

        {/* Checkbox 2 with checkmark */}
        <rect x="130" y="125" width="35" height="35" rx="6" fill="#60A5FA" stroke="#3B82F6" strokeWidth="3"/>
        <path d="M140 142 L148 150 L158 135" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Text lines next to checkbox 2 */}
        <line x1="175" y1="135" x2="270" y2="135" stroke="#93C5FD" strokeWidth="6" strokeLinecap="round"/>
        <line x1="175" y1="150" x2="250" y2="150" stroke="#93C5FD" strokeWidth="6" strokeLinecap="round"/>

        {/* Checkbox 3 - larger checkmark */}
        <path d="M130 190 L155 215 L185 175" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Text lines next to large checkmark */}
        <line x1="200" y1="190" x2="280" y2="190" stroke="#93C5FD" strokeWidth="6" strokeLinecap="round"/>

        {/* Clock circle - pink/rose background */}
        <circle cx="265" cy="225" r="55" fill="#FFC1E3"/>

        {/* Clock circle - white center */}
        <circle cx="265" cy="225" r="45" fill="#FFFFFF" stroke="#4A5568" strokeWidth="5"/>

        {/* Clock hands */}
        <line x1="265" y1="225" x2="265" y2="195" stroke="#4A5568" strokeWidth="5" strokeLinecap="round"/>
        <line x1="265" y1="225" x2="285" y2="215" stroke="#4A5568" strokeWidth="5" strokeLinecap="round"/>

        {/* Clock markers */}
        <circle cx="265" cy="190" r="4" fill="#2D3748"/>
        <circle cx="290" cy="225" r="4" fill="#2D3748"/>
        <circle cx="265" cy="260" r="4" fill="#2D3748"/>
        <circle cx="240" cy="225" r="4" fill="#2D3748"/>

        {/* Checkmark badge - blue circle with white check */}
        <circle cx="215" cy="280" r="35" fill="#60A5FA"/>
        <circle cx="215" cy="280" r="28" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="4"/>
        <path d="M205 280 L212 287 L225 270" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Small decorative dots */}
        <circle cx="155" cy="315" r="7" fill="#2D3748"/>
        <circle cx="310" cy="140" r="7" fill="#2D3748"/>
      </svg>
    </div>
  );
}

// To-Do List Icon - Checklist style
export function TodoListIcon() {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-emerald-50 flex-shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-emerald-600"
      >
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
    </div>
  );
}
