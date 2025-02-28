import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GameRules = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Game Rules</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>12 Pieces Game Rules</DialogTitle>
          <DialogDescription>
            Learn how to play this strategy board game
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <h4 className="font-medium">Objective</h4>
          <p className="text-sm">
            Capture all of your opponent's pieces or block them so they cannot
            move.
          </p>

          <h4 className="font-medium">Movement</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>
              Pieces move one square horizontally, vertically, or diagonally.
            </li>
            <li>Kings can move in any direction.</li>
            <li>A piece becomes a king when it reaches the opponent's edge.</li>
          </ul>

          <h4 className="font-medium">Capturing</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Capture by orthogonally jumping over an opponent's piece.</li>
            <li>
              After capturing, you may continue capturing with the same piece if
              possible.
            </li>
            <li>If a capture is available, you must take it.</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameRules;
