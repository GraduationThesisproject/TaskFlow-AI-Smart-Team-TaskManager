import React, { useState } from "react";
import { Button, Card, CardContent, Typography, Input, Avatar, AvatarImage, AvatarFallback, Switch } from "@taskflow/ui";

const Settings: React.FC = () => {
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <Typography variant="h1" as="h1" className="text-foreground">Settings</Typography>

      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Left Column */}
        <div className="col-span-8 space-y-6">
          {/* Profile Settings */}
          <Card className="bg-card border-border-2-2 rounded-x1">
            <CardContent className="p-6 space-y-4">
              <Typography variant="h3" as="h3" className="text-foreground">Profile Settings</Typography>
              <div className="flex items-center gap-4">
                <Avatar size="xl">
                  <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="Sarah Johnson" />
                  <AvatarFallback variant="primary" size="xl">SJ</AvatarFallback>
                </Avatar>
                <Button variant="secondary" size="sm">Change</Button>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Name</label>
                <Input defaultValue="Sarah Johnson" className="bg-background border-border-2-2" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Email</label>
                <Input defaultValue="sarah@taskflow.com" className="bg-background border-border-2-2" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Password</label>
                <Input type="password" defaultValue="password" className="bg-background border-border-2-2" />
              </div>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card className="bg-card border-border-2 rounded-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="h3" as="h3" className="text-foreground">Team Management</Typography>
                <Button variant="default" size="sm">+ Invite</Button>
              </div>
              <div className="space-y-3">
                {[{name:"Alex Chen", role:"Developer", img: "https://i.pravatar.cc/40?img=11"}, {name:"Mike Rodriguez", role:"Designer", img: "https://i.pravatar.cc/40?img=10"}].map((m) => (
                  <div key={m.name} className="bg-card border-border-2 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={m.img} alt="" className="w-9 h-9 rounded-full" />
                      <div>
                        <p className="font-medium text-sm text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.role}</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="icon-sm">•••</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card border-border-2 rounded-xl">
            <CardContent className="p-6 space-y-4">
              <Typography variant="h3" as="h3" className="text-foreground">Notifications</Typography>

              <div className="bg-card border-border-2 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">Email updates</p>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch variant="default" checked={emailUpdates} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailUpdates(e.target.checked)} />
              </div>

              <div className="bg-card border-border-2 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">Push notifications</p>
                  <p className="text-xs text-muted-foreground">Get instant updates on your device</p>
                </div>
                <Switch variant="default" checked={pushNotifications} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPushNotifications(e.target.checked)} />
              </div>

              <div className="bg-card border-border-2 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">Weekly summary</p>
                  <p className="text-xs text-muted-foreground">Weekly progress reports</p>
                </div>
                <Switch variant="default" checked={weeklySummary} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeeklySummary(e.target.checked)} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-card border-border-2 rounded-xl">
            <CardContent className="p-6 space-y-4">
              <Typography variant="h3" as="h3" className="text-foreground">Appearance</Typography>

              <div>
                <p className="text-sm font-medium text-foreground">Theme</p>
                <p className="text-xs text-muted-foreground mb-2">Choose your preferred theme</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">Dark</Button>
                  <Button size="sm" variant="default">Light</Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">Accent Color</p>
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
          <Card className="bg-card border-border-2 rounded-xl">
            <CardContent className="p-6">
              <Typography variant="h3" as="h3" className="text-foreground">Account Summary</Typography>
              <div className="flex items-center gap-3 mt-3">
                <Avatar size="sm">
                  <AvatarImage src="https://i.pravatar.cc/40?img=12" alt="Sarah Johnson" />
                  <AvatarFallback variant="primary" size="sm">SJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">Project Manager</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 mt-4">
                <p>Projects <span className="float-right text-foreground">12</span></p>
                <p>Team Members <span className="float-right text-foreground">8</span></p>
                <p>Tasks Completed <span className="float-right text-foreground">156</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border-2 rounded-xl">
            <CardContent className="p-6">
              <Typography variant="h3" as="h3" className="text-foreground">Subscription</Typography>
              <div className="mt-2 text-sm">
                <p>Pro Plan</p>
                <p className="text-muted-foreground">$29/month</p>
              </div>
              <Button variant="default" className="mt-4 w-full">Upgrade</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-8">
        <Button variant="destructive" className="text-green-300">Delete Account</Button>
        <div className="flex gap-3">
          <Button variant="default">Cancel</Button>
          <Button variant="default">Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
