import { IoTriangle } from "react-icons/io5";
import { FaDiamond } from "react-icons/fa6";
import { FaCircle, FaSquare, FaSquareFull } from "react-icons/fa";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ShapeTool } from "@/features/editor/components/shape-tool";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShapeSidebarProps {
  editor: any,
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const ShapeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "shapes" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Shapes"
        description="Add shapes to your canvas"
      />
      <ScrollArea>
        <div className="grid grid-cols-3 gap-4 p-4">
          <ShapeTool
            onClick={() => editor?.addCircle()}
            icon={FaCircle}
          />
          <ShapeTool
            onClick={() => { }}
            icon={FaSquare}
          />
          <ShapeTool
            onClick={() => { }}
            icon={FaSquareFull}
          />
          <ShapeTool
            onClick={() => { }}
            icon={IoTriangle}
          />
          <ShapeTool
            onClick={() => { }}
            icon={IoTriangle}
            iconClassName="rotate-180"
          />
          <ShapeTool
            onClick={() => { }}
            icon={FaDiamond}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
