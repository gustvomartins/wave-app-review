import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Moon, Sun, Bell, Mail, Database, Monitor } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";

interface SettingsPageProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your dashboard preferences and notifications
        </p>
      </div>

      <Card className="p-6 rounded-2xl">
        <div className="space-y-6">
          <div>
            <h3 className="mb-4">Appearance</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                <div>
                  <Label>Theme</Label>
                  <p className="text-muted-foreground mt-1">
                    Choose your preferred theme
                  </p>
                </div>
              </div>
              <Select value={theme} onValueChange={(value) => onThemeChange(value as "light" | "dark")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun size={16} />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon size={16} />
                      Dark
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-4">Data Refresh</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database size={20} />
                <div>
                  <Label>Auto-refresh interval</Label>
                  <p className="text-muted-foreground mt-1">
                    How often to fetch new reviews
                  </p>
                </div>
              </div>
              <Select defaultValue="5min">
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1min">Every minute</SelectItem>
                  <SelectItem value="5min">Every 5 minutes</SelectItem>
                  <SelectItem value="15min">Every 15 minutes</SelectItem>
                  <SelectItem value="30min">Every 30 minutes</SelectItem>
                  <SelectItem value="1hour">Every hour</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={20} />
                  <div>
                    <Label>Push notifications</Label>
                    <p className="text-muted-foreground mt-1">
                      Get notified for new reviews
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail size={20} />
                  <div>
                    <Label>Email digest</Label>
                    <p className="text-muted-foreground mt-1">
                      Weekly summary of reviews
                    </p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-4">Review Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alert on low ratings</Label>
                  <p className="text-muted-foreground mt-1">
                    Get notified for 1-2 star reviews
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Alert threshold</Label>
                  <p className="text-muted-foreground mt-1">
                    Minimum rating to trigger alerts
                  </p>
                </div>
                <Select defaultValue="2">
                  <SelectTrigger className="w-[120px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 star</SelectItem>
                    <SelectItem value="2">2 stars</SelectItem>
                    <SelectItem value="3">3 stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}