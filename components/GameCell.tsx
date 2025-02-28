"use client";

import { Cell } from "@/types/game";

interface GameCellProps {
  row: number;
  col: number;
  cell: Cell;
  className: string;
  pieceClassName: string;
  coordinates: string;
  onClick: () => void;
}

const GameCell = ({
  row,
  col,
  cell,
  className,
  pieceClassName,
  coordinates,
  onClick,
}: GameCellProps) => {
  return (
    <div
      className={className}
      onClick={onClick}
      data-testid={`cell-${row}-${col}`}
    >
      {cell && (
        <div className={pieceClassName}>
          {cell.type === "king" && (
            <div className="absolute inset-0 flex items-center justify-center text-yellow-400 text-5xl font-bold">
              ♔
            </div>
          )}
        </div>
      )}
      <div
        className={`absolute top-2 left-2 text-base font-semibold 
        ${(row + col) % 2 === 0 ? 'text-amber-800' : 'text-amber-100'}`}
      >
        {coordinates}
      </div>
    </div>
  );
};

export default GameCell;
