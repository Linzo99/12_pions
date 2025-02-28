"use client";

import { MultiplayerLobby } from "@/app/multiplayer/_components/MultiplayerLobby";
import GameBoard from "@/components/GameBoard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMultiplayer } from "@/context/MultiGameContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MultiGameBoard = () => {
  const { isInRoom } = useMultiplayer();
  const [show, setShow] = useState(!isInRoom);
  const router = useRouter();

  const handleDismiss = (value: boolean) => {
    if (!isInRoom) {
      setShow(false);
      return router.push("/");
    }

    setShow(value);
  };

  return (
    <>
      <Dialog open={show} onOpenChange={handleDismiss}>
        <DialogContent className="sm:max-w-md bg-slate-50">
          <MultiplayerLobby />
        </DialogContent>
      </Dialog>
      <GameBoard />
    </>
  );
};

export default MultiGameBoard;
