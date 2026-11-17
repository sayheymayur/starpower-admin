import { Outlet } from 'react-router';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import AstroSidebar from './AstroSidebar';
import Backdrop from './Backdrop';

const AstroLayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen, toggleMobileSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 xl:flex">
      <AstroSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[260px]' : 'lg:ml-[72px]'
        } ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden rounded-lg border border-gray-200 p-2 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                onClick={toggleMobileSidebar}
                aria-label="Toggle menu"
              >
                ☰
              </button>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-brand-500" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  StarPower Admin
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 max-w-(--breakpoint-2xl) mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AstroLayout: React.FC = () => (
  <SidebarProvider>
    <AstroLayoutContent />
  </SidebarProvider>
);

export default AstroLayout;
