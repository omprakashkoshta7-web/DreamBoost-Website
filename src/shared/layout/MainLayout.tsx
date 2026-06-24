import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { logoutUser } from '@features/auth/store/auth.thunks';
import { selectAuthUser, selectIsAuthenticated } from '@features/auth/store/auth.selectors';
import NotificationPopover from '@shared/components/NotificationPopover';
import BrandLogo from '@shared/components/BrandLogo';
import { UserDropdown } from '@shared/components';
const ChatbotWidget = React.lazy(() => import('@features/chatbot/components/ChatbotWidget'));
import {
  Menu,
  X,
  LogOut,
  User,
  Bell,
  CreditCard,
  Settings,
  Bookmark,
  TrendingUp,
} from '@shared/icons';

interface MainLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { label: 'Dashboard', href: '/app/dashboard' },
  { label: 'My Tests', href: '/app/my-tests' },
  { label: 'Study Material', href: '/app/study-material' },
  { label: 'Leaderboard', href: '/app/leaderboard' },
  { label: 'Bookmarks', href: '/app/bookmarks' },
  { label: 'Support', href: '/app/support' },
];

const userLinks = [
  { label: 'My Library', icon: Bookmark, href: '/app/my-library' },
  { label: 'Study Progress', icon: TrendingUp, href: '/app/study-progress' },
  { label: 'Payment', icon: CreditCard, href: '/app/payment' },
  { label: 'Notifications', icon: Bell, href: '/app/notifications' },
  { label: 'Settings', icon: Settings, href: '/app/settings' },
  { label: 'Profile', icon: User, href: '/app/profile' },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isAuthPage = location.pathname.startsWith('/app/auth');
  if (isAuthPage) return <>{children}</>;

  const isExamPage = location.pathname.startsWith('/app/test-exam/');
  if (isExamPage) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 dark:text-gray-100">
        {children}
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/?auth=login');
    setUserMenuOpen(false);
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 dark:text-gray-100 overflow-x-hidden">
      {/* Top Navbar - Testbook Style */}
      <nav className="sticky top-0 z-50 bg-white shadow-tb border-b border-tb-gray-200/60">
        <div className="max-w-7xl mx-auto px-2 sm:px-5">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/app/dashboard" className="flex-shrink-0">
              <BrandLogo logoClassName="h-10 w-[10rem] sm:h-12 sm:w-[14rem] md:h-14 md:w-[16rem] lg:h-16 lg:w-[18rem] object-cover object-left" textClassName="hidden" />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex flex-1 items-center justify-center gap-1 px-2">
              {navLinks.filter(() => !location.pathname.startsWith('/app/exam-landing') && !location.pathname.startsWith('/app/exam-categories') && !location.pathname.startsWith('/app/test-series')).map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => navigate(link.href)}
                    className={`relative flex h-16 items-center whitespace-nowrap px-2.5 text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:origin-center after:rounded-full after:bg-tb-blue after:transition-transform after:duration-200 ${
                      isActive
                        ? 'text-tb-blue after:scale-x-100'
                        : 'text-tb-gray-600 after:scale-x-0 hover:text-tb-blue hover:after:scale-x-100'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1 sm:gap-2">
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setNotificationOpen(!notificationOpen)}
                      className="relative p-1.5 sm:p-2 rounded-md hover:bg-tb-gray-100 text-tb-gray-500 transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-tb-red rounded-full"></span>
                    </button>
                    {notificationOpen && <NotificationPopover onClose={() => setNotificationOpen(false)} />}
                  </div>

                  <UserDropdown
                    user={user}
                    userInitials={userInitials}
                    isOpen={userMenuOpen}
                    onToggle={() => setUserMenuOpen(!userMenuOpen)}
                    onClose={() => setUserMenuOpen(false)}
                    onLogout={handleLogout}
                    navigate={navigate}
                    links={userLinks}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/?auth=login')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-tb-blue border border-tb-blue rounded-md hover:bg-tb-blue-light transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/?auth=register')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-tb-orange rounded-md hover:bg-tb-orange-hover transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 rounded-md hover:bg-tb-gray-100 text-tb-gray-500"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-tb-gray-200 bg-white animate-slide-up">
            <div className="px-4 py-3 space-y-1">
              {navLinks.filter(() => !location.pathname.startsWith('/app/exam-landing') && !location.pathname.startsWith('/app/exam-categories') && !location.pathname.startsWith('/app/test-series')).map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => { navigate(link.href); setMobileMenuOpen(false); }}
                    className={`relative w-full px-4 py-3 text-left text-sm font-medium transition-colors after:absolute after:bottom-1 after:left-4 after:h-0.5 after:w-10 after:origin-left after:rounded-full after:bg-tb-blue after:transition-transform after:duration-200 ${
                      isActive
                        ? 'text-tb-blue after:scale-x-100'
                        : 'text-tb-gray-600 after:scale-x-0 hover:text-tb-blue hover:after:scale-x-100'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
              <div className="border-t border-tb-gray-100 my-2 pt-2 space-y-1">
                {userLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.href}
                      onClick={() => { navigate(link.href); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm text-tb-gray-600 hover:bg-tb-gray-100 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm text-tb-red hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full">
        {children}
      </main>

      {/* Footer - Testbook Style */}
      <footer className="hidden sm:block bg-tb-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Exams</h4>
              <ul className="space-y-2 text-sm text-tb-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">SSC Exams</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Banking Exams</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Railway Exams</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Teaching Exams</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Defence Exams</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-sm text-tb-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Previous Papers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mock Tests</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Study Material</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Daily Quiz</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-tb-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-sm text-tb-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-tb-navy-light text-center text-sm text-tb-gray-400">
            <p>&copy; 2026 DreamBoost. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
      {isAuthenticated && <ChatbotWidget />}
    </div>
  );
};

export default MainLayout;
