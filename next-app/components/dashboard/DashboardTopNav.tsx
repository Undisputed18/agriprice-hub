export default function DashboardTopNav() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-text-dark dark:text-text-light">
          <div className="size-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.751L12.0799 24Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Agro-Supplier</h2>
        </div>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-4 border-l border-border-light dark:border-border-dark pl-6">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-border-light dark:border-border-dark bg-gray-300"></div>
        </div>
      </div>
    </header>
  );
}
