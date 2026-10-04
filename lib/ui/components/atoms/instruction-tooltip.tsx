import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { LucideCircleQuestionMark } from "lucide-react";

export function InstructionTooltip({
  instruction,
  component: Component,
}: {
  instruction: string;
  component?: any;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild className="cursor-pointer">
        <LucideCircleQuestionMark className="size-4" />
      </TooltipTrigger>
      <TooltipContent className="max-w-md text-sm">
        <p>{instruction ?? " "}</p>
        {Component && <Component />}
      </TooltipContent>
    </Tooltip>
  );
}
