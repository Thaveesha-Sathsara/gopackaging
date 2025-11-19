//import React from 'react'

import { Bell } from "lucide-react";

function Notification() {
  return (
    <div className="dark:text-white" >
      <button className="flex items-center px-3 py-2 space-x-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 dark:bg-gray-800">
        <Bell className="w-4 h-4 dark:text-white" />
        <span className="dark:text-white text-[15px]">Notification</span>
      </button>
    </div>
  );
}

export default Notification;
