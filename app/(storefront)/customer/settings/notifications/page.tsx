"use client";

import { useEffect, useReducer } from "react";
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
import { SETTINGS_NOTIFICATION_TEXT } from "@/constants/customerText";

export enum NotificationSettingsActionType {
  SET_LOADING = "SET_LOADING",
  SET_SAVING = "SET_SAVING",
  SET_SETTINGS = "SET_SETTINGS",
  TOGGLE_SETTING = "TOGGLE_SETTING",
  SET_TIME_CHANGE = "SET_TIME_CHANGE",
}

interface NotificationSettingsState {
  loading: boolean;
  saving: boolean;
  settings: {
    email_tickets: boolean;
    email_orders: boolean;
    email_returns: boolean;
    email_newsletters: boolean;
    in_app_notifications: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
  };
}

type NotificationSettingsAction =
  | { type: NotificationSettingsActionType.SET_LOADING; payload: boolean }
  | { type: NotificationSettingsActionType.SET_SAVING; payload: boolean }
  | { type: NotificationSettingsActionType.SET_SETTINGS; payload: any }
  | { type: NotificationSettingsActionType.TOGGLE_SETTING; payload: keyof NotificationSettingsState["settings"] }
  | { type: NotificationSettingsActionType.SET_TIME_CHANGE; payload: { key: "quiet_hours_start" | "quiet_hours_end"; value: string } };

const notificationSettingsReducer = (state: NotificationSettingsState, action: NotificationSettingsAction): NotificationSettingsState => {
  switch (action.type) {
    case NotificationSettingsActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case NotificationSettingsActionType.SET_SAVING:
      return { ...state, saving: action.payload };
    case NotificationSettingsActionType.SET_SETTINGS:
      return { ...state, settings: action.payload };
    case NotificationSettingsActionType.TOGGLE_SETTING:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload as keyof NotificationSettingsState["settings"]]: !state.settings[action.payload as keyof NotificationSettingsState["settings"]],
        },
      };
    case NotificationSettingsActionType.SET_TIME_CHANGE:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.key]: action.payload.value,
        },
      };
    default:
      return state;
  }
};

export default function NotificationSettingsPage() {
  const { user, isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth,
  );
  const [state, dispatch] = useReducer(notificationSettingsReducer, {
    loading: true,
    saving: false,
    settings: {
      email_tickets: true,
      email_orders: true,
      email_returns: true,
      email_newsletters: false,
      in_app_notifications: true,
      quiet_hours_start: "",
      quiet_hours_end: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchSettings();
    } else {
      dispatch({ type: NotificationSettingsActionType.SET_LOADING, payload: false });
    }
  }, [isAuthenticated, user?.id]);

  const fetchSettings = async () => {
    try {
      dispatch({ type: NotificationSettingsActionType.SET_LOADING, payload: true });
      const res = await AxiosAPI.get(
        `/v1/users/${user?.id}/notification-settings`,
      );
      if (res.data) {
        dispatch({ type: NotificationSettingsActionType.SET_SETTINGS, payload: {
          email_tickets: res.data.email_tickets ?? true,
          email_orders: res.data.email_orders ?? true,
          email_returns: res.data.email_returns ?? true,
          email_newsletters: res.data.email_newsletters ?? false,
          in_app_notifications: res.data.in_app_notifications ?? true,
          quiet_hours_start: res.data.quiet_hours_start || "",
          quiet_hours_end: res.data.quiet_hours_end || "",
        }});
      }
    } catch (err) {
    } finally {
      dispatch({ type: NotificationSettingsActionType.SET_LOADING, payload: false });
    }
  };

  const onSave = async () => {
    if (!user?.id) return;
    try {
      dispatch({ type: NotificationSettingsActionType.SET_SAVING, payload: true });
      const res = await AxiosAPI.post(
        `/v1/users/${user?.id}/notification-settings`,
        state.settings,
      );
      if (res.data) {
        toast.success(SETTINGS_NOTIFICATION_TEXT.SAVE_SUCCESS);
      }
    } catch (err) {
      toast.error(SETTINGS_NOTIFICATION_TEXT.SAVE_ERROR);
    } finally {
      dispatch({ type: NotificationSettingsActionType.SET_SAVING, payload: false });
    }
  };

  const handleToggle = (key: keyof NotificationSettingsState["settings"]) => {
    dispatch({ type: NotificationSettingsActionType.TOGGLE_SETTING, payload: key });
  };

  const handleTimeChange = (
    key: "quiet_hours_start" | "quiet_hours_end",
    value: string,
  ) => {
    dispatch({ type: NotificationSettingsActionType.SET_TIME_CHANGE, payload: { key, value } });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center font-sans">
        <Bell className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
        <h3 className="text-sm font-bold text-foreground mb-1">
          {SETTINGS_NOTIFICATION_TEXT.AUTH_REQUIRED_TITLE}
        </h3>
        <p className="text-xs text-muted-foreground mb-6">
          {SETTINGS_NOTIFICATION_TEXT.AUTH_REQUIRED_DESC}
        </p>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center font-sans">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">{SETTINGS_NOTIFICATION_TEXT.LOADING_PREFERENCES}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans text-left">
      <Card className="shadow-sm border border-border bg-card rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-transparent p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-secondary text-primary rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                {SETTINGS_NOTIFICATION_TEXT.TITLE}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {SETTINGS_NOTIFICATION_TEXT.SUBTITLE}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Email Settings Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2 border-b border-border pb-2.5">
              <Mail className="w-4 h-4 text-primary" />
              {SETTINGS_NOTIFICATION_TEXT.EMAIL_SECTION}
            </h3>

            <div className="flex items-center justify-between py-2 gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">
                  {SETTINGS_NOTIFICATION_TEXT.TICKET_TITLE}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {SETTINGS_NOTIFICATION_TEXT.TICKET_DESC}
                </p>
              </div>
              <input
                type="checkbox"
                checked={state.settings.email_tickets}
                onChange={() => handleToggle("email_tickets")}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">
                  {SETTINGS_NOTIFICATION_TEXT.ORDER_TITLE}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {SETTINGS_NOTIFICATION_TEXT.ORDER_DESC}
                </p>
              </div>
              <input
                type="checkbox"
                checked={state.settings.email_orders}
                onChange={() => handleToggle("email_orders")}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">
                  {SETTINGS_NOTIFICATION_TEXT.RETURN_TITLE}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {SETTINGS_NOTIFICATION_TEXT.RETURN_DESC}
                </p>
              </div>
              <input
                type="checkbox"
                checked={state.settings.email_returns}
                onChange={() => handleToggle("email_returns")}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">
                  {SETTINGS_NOTIFICATION_TEXT.NEWSLETTER_TITLE}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {SETTINGS_NOTIFICATION_TEXT.NEWSLETTER_DESC}
                </p>
              </div>
              <input
                type="checkbox"
                checked={state.settings.email_newsletters}
                onChange={() => handleToggle("email_newsletters")}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Quiet Hours Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2 border-b border-border pb-2.5">
              <Moon className="w-4 h-4 text-primary" />
              {SETTINGS_NOTIFICATION_TEXT.QUIET_HOURS_SECTION}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {SETTINGS_NOTIFICATION_TEXT.QUIET_HOURS_DESC}
            </p>

            <div className="flex items-center justify-between py-2 gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">
                  {SETTINGS_NOTIFICATION_TEXT.IN_APP_TITLE}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {SETTINGS_NOTIFICATION_TEXT.IN_APP_DESC}
                </p>
              </div>
              <input
                type="checkbox"
                checked={state.settings.in_app_notifications}
                onChange={() => handleToggle("in_app_notifications")}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 accent-primary cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {SETTINGS_NOTIFICATION_TEXT.QUIET_START_LABEL}
                </label>
                <input
                  type="time"
                  value={state.settings.quiet_hours_start}
                  onChange={(e) =>
                    handleTimeChange("quiet_hours_start", e.target.value)
                  }
                  className="w-full text-xs px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {SETTINGS_NOTIFICATION_TEXT.QUIET_END_LABEL}
                </label>
                <input
                  type="time"
                  value={state.settings.quiet_hours_end}
                  onChange={(e) =>
                    handleTimeChange("quiet_hours_end", e.target.value)
                  }
                  className="w-full text-xs px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground font-medium"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-border flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                dispatch({
                  type: NotificationSettingsActionType.SET_SETTINGS,
                  payload: {
                    email_tickets: true,
                    email_orders: true,
                    email_returns: true,
                    email_newsletters: false,
                    in_app_notifications: true,
                    quiet_hours_start: "",
                    quiet_hours_end: "",
                  }
                });
                toast.success(SETTINGS_NOTIFICATION_TEXT.RESET_SUCCESS);
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/40 font-bold text-xs cursor-pointer rounded-xl px-4 py-2"
            >
              <Undo className="w-3.5 h-3.5 mr-1" />
              {SETTINGS_NOTIFICATION_TEXT.RESET_DEFAULTS}
            </Button>
            <Button
              onClick={onSave}
              disabled={state.saving}
              className="bg-foreground hover:bg-foreground/90 text-background font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {state.saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {SETTINGS_NOTIFICATION_TEXT.SAVING}
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {SETTINGS_NOTIFICATION_TEXT.SAVE_CHANGES}
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
