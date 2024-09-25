import { IoTriangle } from "react-icons/io5";
import { FaDiamond } from "react-icons/fa6";
import { FaCircle, FaSquare, FaSquareFull } from "react-icons/fa";

import { ActiveTool, ActiveToolItem, Editor } from "@/features/editor/types";
import { ShapeTool } from "@/features/editor/components/shape-tool";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";


interface ShapeSidebarProps {
  editor: Editor | undefined,
  activeTool: ActiveTool;
  activeToolItem: ActiveToolItem;
  onChangeActiveTool: (tool: ActiveTool) => void;
  onChangeActiveToolItem: (toolItem: ActiveToolItem) => void;
};

export const ShapeSidebar = ({
  editor,
  activeTool,
  activeToolItem,
  onChangeActiveTool,
  onChangeActiveToolItem
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
            onClick={() => onChangeActiveToolItem("circle")}
            icon={FaCircle}
            isActivate={activeToolItem === "circle"}
          />
          <ShapeTool
            onClick={() => { }}
            icon={FaSquare}
            isActivate={false}
          />
          <ShapeTool
            onClick={() => { }}
            icon={FaSquareFull}
            isActivate={false}
          />
          <ShapeTool
            onClick={() => { }}
            icon={IoTriangle}
            isActivate={false}

          />
          <ShapeTool
            onClick={() => { }}
            icon={IoTriangle}
            iconClassName="rotate-180"
            isActivate={false}

          />
          <ShapeTool
            onClick={() => { }}
            icon={FaDiamond}
            isActivate={false}
          />
        </div>

      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
