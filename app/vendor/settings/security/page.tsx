"use client";

import { useForm } from "react-hook-form";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import { ChangePasswordData } from "@/utils/validation";
import { SECURITY_SETTINGS_TEXT } from "@/constants/vendorText";

export interface securitySettingsDataType {
  two_factor_enabled: boolean;
  active_sessions: {
    id: number;
    device: string;
    location: string;
    last_active: string;
  }[];
}
const securitySettingsData: securitySettingsDataType = {
  two_factor_enabled: false,
  active_sessions: [
    {
      id: 1,
      device: "Chrome on Windows 10",
      location: "New York, USA",
      last_active: "2024-06-01 14:30",
    },
  ],
};
export default function SecurityPage() {
  const { register, getValues, setValue, watch, handleSubmit } =
    useForm<ChangePasswordData>({
      defaultValues: {
        current_password: "",
        new_password: "",
        confirm_password: "",
      },
    });
  const [securitySettingsDataState, setSecuritySettingsDataState] =
    useState(securitySettingsData);
  const onSubmit = (data: ChangePasswordData) => {};
  const toggleTwoFactor = () => {
    setSecuritySettingsDataState({
      ...securitySettingsDataState,
      two_factor_enabled: !securitySettingsDataState.two_factor_enabled,
    });
  };
  return (
    <>
      <main
        className={` mt-6   ml-70 max-h-screen min-h-screen overflow-y-scroll `}
      >
        <form
          className="vendor_settings_content   mt-0  px-6 py-6 bg-white border-2 border-gray-300 rounded-lg"
          onSubmit={handleSubmit((data) => {})}
        >
          <h2 className="text-theme-h4 font-bold mb-4">
            {SECURITY_SETTINGS_TEXT.TITLE}
          </h2>
          <section className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-2 font-bold">
                {SECURITY_SETTINGS_TEXT.LABELS.CURRENT_PASSWORD}
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg py-2 px-4"
                placeholder={
                  SECURITY_SETTINGS_TEXT.PLACEHOLDERS.CURRENT_PASSWORD
                }
                {...register("current_password")}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-bold">
                {SECURITY_SETTINGS_TEXT.LABELS.NEW_PASSWORD}
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg py-2 px-4"
                placeholder={SECURITY_SETTINGS_TEXT.PLACEHOLDERS.NEW_PASSWORD}
                {...register("new_password")}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-bold">
                {SECURITY_SETTINGS_TEXT.LABELS.CONFIRM_PASSWORD}
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg py-2 px-4"
                placeholder={
                  SECURITY_SETTINGS_TEXT.PLACEHOLDERS.CONFIRM_PASSWORD
                }
                {...register("confirm_password")}
              />
            </div>
          </section>
          <div className="mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white font-medium rounded-xl"
            >
              {SECURITY_SETTINGS_TEXT.UPDATE_BTN}
            </button>
          </div>
        </form>

        <section className=" my-6 px-6 py-6 border-2 border-gray-300 rounded-lg bg-white">
          <div className="flex  justify-between items-center gap-12">
            <span>
              <h2 className="text-theme-h4 font-bold mb-4">
                {SECURITY_SETTINGS_TEXT.TFA.TITLE}
              </h2>
              <p className="text-gray-600 mb-4">
                {SECURITY_SETTINGS_TEXT.TFA.DESC}
              </p>
            </span>
            {
              <button
                className=" transition ease-in-out delay-250 "
                onClick={() => {
                  toggleTwoFactor();
                }}
              >
                {securitySettingsDataState.two_factor_enabled ? (
                  <ToggleRight
                    width={86}
                    height={86}
                    className=" "
                    fill="green"
                    fillOpacity={0.5}
                    stroke="green"
                    strokeWidth={1}
                  />
                ) : (
                  <ToggleLeft
                    width={86}
                    height={86}
                    className=" "
                    fill="grey"
                    fillOpacity={0.5}
                    stroke="gray"
                    strokeWidth={1}
                  />
                )}
              </button>
            }
          </div>
          <h1></h1>
          <div className="mt-10">
            <h2 className="text-theme-h4 font-bold mb-4">
              {SECURITY_SETTINGS_TEXT.SESSIONS.TITLE}
            </h2>
            <p className="text-gray-600 mb-4">
              {SECURITY_SETTINGS_TEXT.SESSIONS.DESC}
            </p>
            <button className="px-6 py-2 bg-red-500 text-white font-medium rounded-xl">
              {SECURITY_SETTINGS_TEXT.SESSIONS.MANAGE_BTN}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
