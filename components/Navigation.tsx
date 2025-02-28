"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGame } from "@/context/GameContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { dispatch, state } = useGame();
  const { isMultiplayer } = state;

  useEffect(() => {
    handleModeChange(pathname === "/multiplayer");
  }, [pathname]);

  const handleModeChange = (checked: boolean) => {
    dispatch({ type: "SET_MULTIPLAYER", value: checked });
    router.push(checked ? "/multiplayer" : "/");
  };

  return (
    <nav className="w-full flex justify-center">
      <div className="flex items-center gap-3 bg-indigo-50 px-6 py-3 rounded-full shadow-sm hover:shadow transition-shadow duration-300">
        <Label
          htmlFor="mode-switch"
          className={`font-medium cursor-pointer transition-colors duration-300 ${isMultiplayer ? "text-gray-500" : "text-blue-700"}`}
        >
          Single Player
        </Label>

        <Switch
          id="mode-switch"
          checked={state.isMultiplayer}
          onCheckedChange={handleModeChange}
          className="mx-2"
        />

        <Label
          htmlFor="mode-switch"
          className={`font-medium cursor-pointer transition-colors duration-300 ${isMultiplayer ? "text-blue-700" : "text-gray-500"}`}
        >
          Multiplayer
        </Label>
      </div>
    </nav>
  );
}
