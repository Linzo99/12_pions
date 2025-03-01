"use client";

import { useGameBoard } from "@/hooks/useGameBoard";
import GameCell from "./GameCell";
import GameControls from "./GameControls";
import GameInfo from "./GameInfo";
import { cn } from "@/lib/utils";

export const GameBoard = () => {
  const {
    board,
    isThinking,
    handleCellClick,
    getCellClasses,
    getPieceClasses,
    getCellCoordinates,
    isMultiplayer,
    playerId,
  } = useGameBoard();

  return (
    <div className="">
      <GameControls />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center lg:items-start w-full max-w-7xl mx-auto">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <div
            className={cn(
              "relative grid grid-cols-5 gap-0 border-4 md:border-8 border-primary shadow-xl aspect-square",
              isMultiplayer && playerId == 2 && "rotate-180",
            )}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <GameCell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  cell={cell}
                  className={getCellClasses(rowIndex, colIndex)}
                  pieceClassName={
                    cell
                      ? getPieceClasses(cell.player, cell.type === "king")
                      : ""
                  }
                  coordinates={getCellCoordinates(rowIndex, colIndex)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                />
              )),
            )}
          </div>
        </div>
        <GameInfo />
      </div>

      {isThinking && (
        <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
          Computer is thinking...
        </div>
      )}
    </div>
  );
};

export default GameBoard;
