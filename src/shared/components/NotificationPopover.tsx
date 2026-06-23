import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchNotifications, markAsRead } from '@features/notifications/store/notification.thunks';
import { selectNotifications, selectUnreadCount, selectNotificationLoading } from '@features/notifications/store/notification.selectors';
import { Loader } from '@shared/components';
import { Bell, BookOpen, Trophy, Award, CreditCard, Settings, Clock, ChevronRight, X, Flame } from '@shared/icons';

interface NotificationPopoverProps {
  onClose: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'test':
    case 'test_launch':
      return <BookOpen className="w-4 h-4 text-tb-blue" />;
    case 'reminder': return <Flame className="w-4 h-4 text-tb-orange" />;
    case 'result': return <Trophy className="w-4 h-4 text-green-600" />;
    case 'achievement': return <Award className="w-4 h-4 text-tb-orange" />;
    case 'payment': return <CreditCard className="w-4 h-4 text-purple-600" />;
    default: return <Settings className="w-4 h-4 text-tb-gray-400" />;
  }
};

const getBgColor = (type: string) => {
  switch (type) {
    case 'test':
    case 'test_launch':
      return 'bg-blue-50';
    case 'reminder': return 'bg-orange-50';
    case 'result': return 'bg-green-50';
    case 'achievement': return 'bg-orange-50';
    case 'payment': return 'bg-purple-50';
    default: return 'bg-tb-gray-50';
  }
};

const formatTime = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const NotificationPopover: React.FC<NotificationPopoverProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const loading = useAppSelector(selectNotificationLoading);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const recent = notifications.slice(0, 5);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div ref={popoverRef} className="fixed mt-2 right-3 sm:right-4 top-14 w-[calc(100%-24px)] sm:w-80 max-w-sm bg-white rounded-2xl shadow-2xl border border-tb-gray-200/60 z-50 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-tb-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-tb-blue" />
            <span className="text-sm font-bold text-tb-navy">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-tb-blue text-white">{unreadCount}</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-tb-gray-100 transition-colors">
            <X className="w-4 h-4 text-tb-gray-400" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <Loader size="sm" label="Loading..." />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Bell className="w-8 h-8 text-tb-gray-300 mx-auto mb-2" />
              <p className="text-sm text-tb-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-tb-gray-50">
              {recent.map((n) => (
                <div key={n._id} className={`flex items-start gap-3 px-4 py-3 hover:bg-tb-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                  onClick={() => { if (!n.isRead) dispatch(markAsRead(n._id)); }}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getBgColor(n.type)}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-tb-navy truncate">{n.title}</p>
                    <p className="text-[11px] text-tb-gray-500 mt-0.5 line-clamp-1">{n.message || n.body}</p>
                    <span className="text-[10px] text-tb-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {formatTime(n.createdAt)}
                    </span>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-tb-blue rounded-full flex-shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => { navigate('/app/notifications'); onClose(); }}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-tb-blue border-t border-tb-gray-100 hover:bg-blue-50 transition-colors">
          View All Notifications <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

export default NotificationPopover;
