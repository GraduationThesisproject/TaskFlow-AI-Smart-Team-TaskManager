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

              <div className="bg-card border-border-2 rounded-lg p-4 flex items-center justify-between group/switch">
                <div>
                  <p className="font-medium text-sm text-foreground">Email updates</p>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <div className="relative">
                  <Switch 
                    variant="default" 
                    checked={emailUpdates} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailUpdates(e.target.checked)}
                    className="relative z-10 data-[state=checked]:bg-primary/90 data-[state=unchecked]:bg-muted-foreground/20"
                  />
                  {emailUpdates && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-[8px] -z-10 animate-pulse"></div>
                  )}
                </div>
              </div>

              <div className="bg-card border-border-2 rounded-lg p-4 flex items-center justify-between group/switch">
                <div>
                  <p className="font-medium text-sm text-foreground">Push notifications</p>
                  <p className="text-xs text-muted-foreground">Get instant updates on your device</p>
                </div>
                <div className="relative">
                  <Switch 
                    variant="default" 
                    checked={pushNotifications} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPushNotifications(e.target.checked)}
                    className="relative z-10 data-[state=checked]:bg-primary/90 data-[state=unchecked]:bg-muted-foreground/20"
                  />
                  {pushNotifications && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-[8px] -z-10 animate-pulse"></div>
                  )}
                </div>
              </div>

              <div className="bg-card border-border-2 rounded-lg p-4 flex items-center justify-between group/switch">
                <div>
                  <p className="font-medium text-sm text-foreground">Weekly summary</p>
                  <p className="text-xs text-muted-foreground">Weekly progress reports</p>
                </div>
                <div className="relative">
                  <Switch 
                    variant="default" 
                    checked={weeklySummary} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeeklySummary(e.target.checked)}
                    className="relative z-10 data-[state=checked]:bg-primary/90 data-[state=unchecked]:bg-muted-foreground/20"
                  />
                  {weeklySummary && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-[8px] -z-10 animate-pulse"></div>
                  )}
                </div>
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
              <div className="relative group">
                <Button 
                  variant="default" 
                  className="mt-4 w-full relative overflow-hidden z-10
                  bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70
                  text-white font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30
                  transition-all duration-300 transform hover:-translate-y-0.5
                  before:absolute before:inset-0 before:bg-[radial-gradient(300px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(255,255,255,0.2),transparent_40%)]
                  before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]">✨</span>
                    Upgrade Now
                    <span className="absolute -right-2 -top-2 w-2 h-2 rounded-full bg-white/80 animate-ping"></span>
                  </span>
                </Button>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-transparent to-primary/30 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
              </div>
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
