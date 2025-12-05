//import React from 'react'

import { Bell } from "lucide-react";

function Notification() {
  return (
    <div className="" >
      <button className="flex items-center px-3 py-2 space-x-2 border border-gray-300 rounded-lg hover:bg-gray-50">
        <Bell className="w-4 h-4" />
        <span className=" text-[15px]">Notification</span>
      </button>
    </div>
  );
}

export default Notification;
