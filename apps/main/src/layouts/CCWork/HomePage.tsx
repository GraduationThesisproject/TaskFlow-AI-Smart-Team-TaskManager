import React from "react";
import { Briefcase, Code } from "lucide-react";
import { Button } from "@taskflow/ui";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white px-8 py-6">
      {/* Header */}
      <h1 className="text-3xl font-bold">Welcome back, Sarah!</h1>
      <p className="text-gray-400 mt-1">Here's what's happening with your projects today.</p>

      <div className="grid grid-cols-12 gap-6 mt-8">
        {/* Left Section */}
        <div className="col-span-8">
          {/* Workspaces */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Workspaces</h2>
              <Button variant="default">+ New</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Marketing Team */}
              <div className="bg-neutral-900 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm bg-neutral-800 px-3 py-1 rounded-full">
                    12 members
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-lg">Marketing Team</h3>
                <p className="text-gray-500 text-sm">
                  Q1 Campaign Planning & Social Media Strategy
                </p>
                <div className="flex items-center mt-3 space-x-2">
                  <img
                    src="https://i.pravatar.cc/32?img=1"
                    alt=""
                    className="w-7 h-7 rounded-full"
                  />
                  <img
                    src="https://i.pravatar.cc/32?img=2"
                    alt=""
                    className="w-7 h-7 rounded-full"
                  />
                  <img
                    src="https://i.pravatar.cc/32?img=3"
                    alt=""
                    className="w-7 h-7 rounded-full"
                  />
                </div>
                <p className="text-gray-600 text-xs mt-2">Last active 2h ago</p>
              </div>

              {/* Product Development */}
              <div className="bg-neutral-900 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm bg-neutral-800 px-3 py-1 rounded-full">
                    8 members
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-lg">Product Development</h3>
                <p className="text-gray-500 text-sm">
                  Mobile App v2.0 Development & Testing
                </p>
                <div className="flex items-center mt-3 space-x-2">
                  <img
                    src="https://i.pravatar.cc/32?img=4"
                    alt=""
                    className="w-7 h-7 rounded-full"
                  />
                  <img
                    src="https://i.pravatar.cc/32?img=5"
                    alt=""
                    className="w-7 h-7 rounded-full"
                  />
                </div>
                <p className="text-gray-600 text-xs mt-2">Active now</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="bg-neutral-900 rounded-lg px-4 py-3 flex items-center gap-3">
                <img src="https://i.pravatar.cc/40?img=6" alt="" className="w-9 h-9 rounded-full" />
                <div>
                  <p>
                    <span className="font-medium">John Smith</span> moved{" "}
                    <span className="text-emerald-400">"Design Review"</span> to Done
                  </p>
                  <p className="text-gray-500 text-sm">Marketing Team • 2 hours ago</p>
                </div>
              </div>
              <div className="bg-neutral-900 rounded-lg px-4 py-3 flex items-center gap-3">
                <img src="https://i.pravatar.cc/40?img=7" alt="" className="w-9 h-9 rounded-full" />
                <div>
                  <p>
                    <span className="font-medium">Emma Davis</span> assigned you to{" "}
                    <span className="text-emerald-400">"API Integration"</span>
                  </p>
                  <p className="text-gray-500 text-sm">Product Development • 4 hours ago</p>
                </div>
              </div>
              <div className="bg-neutral-900 rounded-lg px-4 py-3 flex items-center gap-3">
                <img src="https://i.pravatar.cc/40?img=8" alt="" className="w-9 h-9 rounded-full" />
                <div>
                  <p>
                    <span className="font-medium">Mike Johnson</span> commented on{" "}
                    <span className="text-emerald-400">"User Testing Results"</span>
                  </p>
                  <p className="text-gray-500 text-sm">Marketing Team • 6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-span-4 space-y-6">
          {/* Notifications */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="bg-neutral-900 rounded-lg p-4 mb-3">
              <p className="font-medium">Team Invitation</p>
              <p className="text-gray-500 text-sm">Join "Design System" workspace</p>
              <div className="flex gap-2 mt-3">
                <Button variant="accent">Accept</Button>
                <Button variant="secondary">Decline</Button>
              </div>
            </div>
            <div className="bg-neutral-900 rounded-lg p-4">
              <p className="font-medium text-red-400">Due Date Reminder</p>
              <p className="text-gray-500 text-sm">"Q1 Report" due tomorrow</p>
            </div>
          </div>

          {/* Events */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            <div className="bg-neutral-900 rounded-lg p-4 mb-3">
              <p className="text-gray-400 text-sm">JAN 24</p>
              <p className="font-medium">Team Standup</p>
              <p className="text-gray-500 text-sm">9:00 AM • Marketing Team</p>
            </div>
            <div className="bg-neutral-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm">JAN 25</p>
              <p className="font-medium">Sprint Review</p>
              <p className="text-gray-500 text-sm">2:00 PM • Product Development</p>
            </div>
          </div>

          {/* Upgrade */}
          <div className="bg-gradient-to-r from-sky-500 to-emerald-400 rounded-xl p-6 text-black">
            <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
            <p className="text-sm mt-1">
              Unlock timeline view, calendar integration, and advanced reporting
            </p>
            <Button variant="secondary">Upgrade</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
