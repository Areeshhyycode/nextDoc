// Project Overview Icon - Using image from assets
export function ProjectOverviewIcon() {
  return (
    <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
      <img
        src="/projectView.png"
        alt="Project Overview"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// Meeting Notes Icon - Using SVG from assets
export function MeetingNotesIcon() {
  return (
    <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-orange-50 flex-shrink-0">
      <img
        src="/meetingNotes.svg"
        alt="Meeting Notes"
        className="w-4 h-4 object-contain"
        style={{ filter: 'invert(35%) sepia(98%) saturate(1000%) hue-rotate(360deg) brightness(95%) contrast(95%)' }}
      />
    </div>
  );
}
