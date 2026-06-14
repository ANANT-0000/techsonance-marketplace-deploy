"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Moon, Save, Undo, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import AxiosAPI from "@/lib/axios";

export default function NotificationSettingsPage() {
  const { user, isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    email_tickets: true,
    email_orders: true,
    email_returns: true,
    email_newsletters: false,
    in_app_notifications: true,
    quiet_hours_start: "",
    quiet_hours_end: "",
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await AxiosAPI.get(
        `/v1/users/${user?.id}/notification-settings`,
      );
      if (res.data) {
        setSettings({
          email_tickets: res.data.email_tickets ?? true,
          email_orders: res.data.email_orders ?? true,
          email_returns: res.data.email_returns ?? true,
          email_newsletters: res.data.email_newsletters ?? false,
          in_app_notifications: res.data.in_app_notifications ?? true,
          quiet_hours_start: res.data.quiet_hours_start || "",
          quiet_hours_end: res.data.quiet_hours_end || "",
        });
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const res = await AxiosAPI.post(
        `/v1/users/${user?.id}/notification-settings`,
        settings,
      );
      if (res.data) {
        toast.success("Preferences updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTimeChange = (
    key: "quiet_hours_start" | "quiet_hours_end",
    value: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-theme-h6 font-bold text-gray-900 mb-1">
          Authentication Required
        </h3>
        <p className="text-theme-body-sm text-gray-500 mb-6">
          Please log in to manage your notification settings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-theme-body-sm text-gray-500">Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="shadow-lg border border-gray-100 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-theme-h5 font-bold text-gray-900">
                Notification Settings
              </CardTitle>
              <CardDescription className="text-theme-caption text-gray-505 mt-0.5">
                Customize when and how you receive alerts and messages.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Email Settings Section */}
          <div className="space-y-4">
            <h3 className="text-theme-body-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Email Notifications
            </h3>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-theme-body-sm font-semibold text-gray-800">
                  Support Ticket Updates
                </p>
                <p className="text-theme-caption text-gray-500">
                  Receive replies and status updates for your support cases.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.email_tickets}
                onChange={() => handleToggle("email_tickets")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-theme-body-sm font-semibold text-gray-800">
                  Order Updates
                </p>
                <p className="text-theme-caption text-gray-500">
                  Receipts, confirmations, and shipping tracking updates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.email_orders}
                onChange={() => handleToggle("email_orders")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-theme-body-sm font-semibold text-gray-800">
                  Returns & Replacements
                </p>
                <p className="text-theme-caption text-gray-500">
                  Status changes and processing updates on return requests.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.email_returns}
                onChange={() => handleToggle("email_returns")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-theme-body-sm font-semibold text-gray-800">
                  Newsletter & Offers
                </p>
                <p className="text-theme-caption text-gray-500">
                  Receive news, personalized recommendations and discount
                  offers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.email_newsletters}
                onChange={() => handleToggle("email_newsletters")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quiet Hours Section */}
          <div className="space-y-4">
            <h3 className="text-theme-body-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Moon className="w-4 h-4 text-blue-600" />
              Quiet Hours (Do Not Disturb)
            </h3>
            <p className="text-theme-caption text-gray-500 leading-relaxed">
              Mute push and in-app notifications during specified times. Email
              alerts will still arrive but won't trigger browser alerts.
            </p>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-theme-body-sm font-semibold text-gray-800">
                  In-App Notifications
                </p>
                <p className="text-theme-caption text-gray-500">
                  Show floating alerts and notification badges on website.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.in_app_notifications}
                onChange={() => handleToggle("in_app_notifications")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Quiet Hours Start
                </label>
                <input
                  type="time"
                  value={settings.quiet_hours_start}
                  onChange={(e) =>
                    handleTimeChange("quiet_hours_start", e.target.value)
                  }
                  className="w-full text-theme-caption px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Quiet Hours End
                </label>
                <input
                  type="time"
                  value={settings.quiet_hours_end}
                  onChange={(e) =>
                    handleTimeChange("quiet_hours_end", e.target.value)
                  }
                  className="w-full text-theme-caption px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setSettings({
                  email_tickets: true,
                  email_orders: true,
                  email_returns: true,
                  email_newsletters: false,
                  in_app_notifications: true,
                  quiet_hours_start: "",
                  quiet_hours_end: "",
                });
                toast.success("Preferences reset to defaults");
              }}
              className="text-gray-500 hover:text-gray-900 font-bold text-theme-caption"
            >
              <Undo className="w-3.5 h-3.5 mr-1" />
              Reset Defaults
            </Button>
            <Button
              onClick={onSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-750 text-white font-bold text-theme-caption px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Toaster position="top-center" />
    </div>
  );
}
