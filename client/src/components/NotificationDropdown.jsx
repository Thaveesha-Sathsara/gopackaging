import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { Bell } from "lucide-react";
import { format } from "date-fns";
import { useNotifications } from "@/hooks/meetings/useNotifications";

const NotificationDropdown = () => {
  const { notifications, isLoading, markAsRead, clearRead } = useNotifications();

  // Filter out cleared notifications and map to display format
  const displayNotifications = notifications
    .filter(notification => !notification.isCleared)
    .map(notification => {
      const meeting = notification.meeting;
      const meetingDate = meeting?.date ? new Date(meeting.date) : new Date();
      const meetingType = meeting?.meetingType?.meetingType || "Meeting";
      
      return {
        id: notification._id,
        meetingId: meeting?._id,
        text: `${meetingType} scheduled`,
        date: format(meetingDate, "MMM dd, yyyy"),
        createdAt: new Date(notification.createdAt),
        isRead: notification.isRead,
      };
    });

  // Get unread count
  const unreadCount = displayNotifications.filter(n => !n.isRead).length;

  // Handle marking a notification as read
  const handleNotificationClick = (notificationId, isRead) => {
    if (!isRead) {
      markAsRead.mutate(notificationId);
    }
  };

  // Handle clearing all read notifications
  const handleClearAllRead = () => {
    clearRead.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-2 border-blue-500 text-blue-700 bg-white hover:bg-blue-50 flex items-center gap-2 px-6 py-2 font-medium relative"
        >
          <Bell className="w-5 h-5" />
          Notification
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-2 border-b flex justify-between items-center">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2"
              onClick={() => {
                // Mark all as read
                displayNotifications
                  .filter(n => !n.isRead)
                  .forEach(n => markAsRead.mutate(n.id));
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <DropdownMenuItem className="p-3 text-sm text-gray-500">
            Loading notifications...
          </DropdownMenuItem>
        ) : displayNotifications.length > 0 ? (
          <div className="divide-y">
            {displayNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${notification.isRead ? 'opacity-70' : 'bg-blue-50'}`}
                onClick={() => handleNotificationClick(notification.id, notification.isRead)}
              >
                <div className="flex items-start w-full">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Date: {notification.date}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="ml-2 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <DropdownMenuItem className="p-3 text-sm text-gray-500">
            No notifications
          </DropdownMenuItem>
        )}
        
        {displayNotifications.some(notification => notification.isRead) && (
          <div className="p-2 border-t">
            <Button 
              variant="ghost" 
              className="w-full text-xs"
              onClick={handleClearAllRead}
              disabled={clearRead.isLoading}
            >
              {clearRead.isLoading ? "Clearing..." : "Clear read notifications"}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;