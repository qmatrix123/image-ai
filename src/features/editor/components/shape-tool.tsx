import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ShapeToolProps {
  onClick: () => void;
  icon: LucideIcon | IconType;
  iconClassName?: string;
  isActivate: boolean;
};

export const ShapeTool = ({
  onClick,
  icon: Icon,
  iconClassName,
  isActivate
}: ShapeToolProps) => {
  return (
    <button
      onClick={onClick}
      className={cn("aspect-square border rounded-md p-5", isActivate && "bg-green-100")}
    >
      <Icon className={cn("h-full w-full", iconClassName)} />
    </button>
  );
};
