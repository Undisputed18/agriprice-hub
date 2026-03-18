interface AdminTopNavProps {
  onMenuClick?: () => void;
}

export default function AdminTopNav({ onMenuClick }: AdminTopNavProps) {
  const handleNotifications = () => {
    console.log('Notifications clicked');
    // Add notification logic here
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    // Add settings logic here
  };

  const handleProfile = () => {
    console.log('Profile clicked');
    // Add profile logic here
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 md:px-10 py-3">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-text-secondary hover:bg-surface-light dark:hover:bg-surface-dark rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex items-center gap-4 text-text-dark dark:text-text-light">
          <div className="size-6 text-primary hidden sm:block">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.751L12.0799 24Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-base md:text-lg font-bold leading-tight tracking-[-0.015em] truncate">AgriPrice Admin</h2>
        </div>
      </div>
      <div className="flex flex-1 justify-end gap-2 md:gap-8">
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            onClick={handleNotifications}
            className="p-2 text-text-secondary hover:bg-surface-light dark:hover:bg-surface-dark rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button 
            onClick={handleSettings}
            className="p-2 text-text-secondary hover:bg-surface-light dark:hover:bg-surface-dark rounded-lg transition-colors cursor-pointer hidden sm:block"
            title="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div className="flex items-center gap-4 border-l border-border-light dark:border-border-dark pl-2 md:pl-6">
          <button
            onClick={handleProfile}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 md:size-9 border border-border-light dark:border-border-dark bg-gray-300 hover:opacity-80 transition-opacity cursor-pointer"
            title="Profile"
          ></button>
        </div>
      </div>
    </header>
  );
}
