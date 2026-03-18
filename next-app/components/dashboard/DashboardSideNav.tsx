export default function DashboardSideNav() {
  return (
    <aside className="w-64 flex-shrink-0 bg-background-light dark:bg-background-dark border-r border-border-light dark:border-border-dark flex flex-col">
      <div className="p-6 flex flex-col h-full">
        <div className="flex flex-col mb-8">
          <h1 className="text-text-dark dark:text-text-light text-base font-bold uppercase tracking-wider">
            Dashboard
          </h1>
          <p className="text-text-secondary dark:text-text-secondary/80 text-xs font-normal">Navigation menu</p>
        </div>
        <nav className="flex flex-col gap-2 flex-grow">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors bg-primary text-white">
            <span className="material-symbols-outlined">dashboard</span>
            <p className="text-sm font-medium">Overview</p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-surface-light dark:hover:bg-surface-dark text-text-dark dark:text-text-light/80">
            <span className="material-symbols-outlined">inventory</span>
            <p className="text-sm font-medium">Inventory</p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-surface-light dark:hover:bg-surface-dark text-text-dark dark:text-text-light/80">
            <span className="material-symbols-outlined">store</span>
            <p className="text-sm font-medium">Shops</p>
          </button>
        </nav>
      </div>
    </aside>
  );
}
