import React, { useState } from "react";
import { Button, Card, CardContent, Typography, Input, Avatar, AvatarImage, AvatarFallback, Checkbox } from "@taskflow/ui";

const Settings: React.FC = () => {
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Typography variant="h1" as="h1">Settings</Typography>

      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Left Column */}
        <div className="col-span-8 space-y-6">
          {/* Profile Settings */}
          <Card className="bg-neutral-950 border-neutral-800 rounded-xl">
            <CardContent className="p-6 space-y-4">
              <Typography variant="h3" as="h3">Profile Settings</Typography>
              <div className="flex items-center gap-4">
                <Avatar size="xl">
                  <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="Sarah Johnson" />
                  <AvatarFallback variant="primary" size="xl">SJ</AvatarFallback>
                </Avatar>
                <Button variant="secondary" size="sm">Change</Button>
              </div>
              <div>
                <label className="block text-sm mb-1">Name</label>
                <Input defaultValue="Sarah Johnson" />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <Input defaultValue="sarah@taskflow.com" />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <Input type="password" defaultValue="password" />
              </div>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card className="bg-neutral-950 border-neutral-800 rounded-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="h3" as="h3">Team Management</Typography>
                <Button variant="accent" size="sm">+ Invite</Button>
              </div>
              <div className="space-y-3">
                {[{name:"Alex Chen", role:"Developer", img: "https://i.pravatar.cc/40?img=11"}, {name:"Mike Rodriguez", role:"Designer", img: "https://i.pravatar.cc/40?img=10"}].map((m) => (
                  <div key={m.name} className="bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={m.img} alt="" className="w-9 h-9 rounded-full" />
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="icon-sm">•••</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-neutral-950 border-neutral-800 rounded-xl">
            <CardContent className="p-6 space-y-4">
              <Typography variant="h3" as="h3">Notifications</Typography>

              <div className="bg-neutral-900 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Email updates</p>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <Checkbox checked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />
              </div>

              <div className="bg-neutral-900 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Push notifications</p>
                  <p className="text-xs text-gray-500">Get instant updates on your device</p>
                </div>
                <Checkbox checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />
              </div>

              <div className="bg-neutral-900 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Weekly summary</p>
                  <p className="text-xs text-gray-500">Weekly progress reports</p>
                </div>
                <Checkbox checked={weeklySummary} onChange={(e) => setWeeklySummary(e.target.checked)} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-neutral-950 border-neutral-800 rounded-xl">
            <CardContent className="p-6 space-y-4">
              <Typography variant="h3" as="h3">Appearance</Typography>

              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-gray-500 mb-2">Choose your preferred theme</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">Dark</Button>
                  <Button size="sm" variant="secondary">Light</Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Accent Color</p>
                <div className="flex gap-3 mt-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 inline-block" />
                  <span className="w-6 h-6 rounded-full bg-emerald-400 inline-block" />
                  <span className="w-6 h-6 rounded-full bg-cyan-400 inline-block" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-6">
          <Card className="bg-neutral-950 border-neutral-800 rounded-xl">
            <CardContent className="p-6">
              <Typography variant="h3" as="h3">Account Summary</Typography>
              <div className="flex items-center gap-3 mt-3">
                <Avatar size="sm">
                  <AvatarImage src="https://i.pravatar.cc/40?img=12" alt="Sarah Johnson" />
                  <AvatarFallback variant="primary" size="sm">SJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Project Manager</p>
                </div>
              </div>
              <div className="text-xs text-gray-400 space-y-1 mt-4">
                <p>Projects <span className="float-right text-white">12</span></p>
                <p>Team Members <span className="float-right text-white">8</span></p>
                <p>Tasks Completed <span className="float-right text-white">156</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-neutral-800 rounded-xl">
            <CardContent className="p-6">
              <Typography variant="h3" as="h3">Subscription</Typography>
              <div className="mt-2 text-sm">
                <p>Pro Plan</p>
                <p className="text-gray-500">$29/month</p>
              </div>
              <Button variant="accent" className="mt-4 w-full">Upgrade</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" className="text-red-400">Delete Account</Button>
        <div className="flex gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button variant="accent">Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;


