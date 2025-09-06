import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface SidebarTooltipProps {
  children: ReactNode;
  label: string;
  isCollapsed: boolean;
}

export function SidebarTooltip({ children, label, isCollapsed }: SidebarTooltipProps) {
  // If the sidebar is expanded, don't show a tooltip, just the children.
  if (!isCollapsed) {
    return <>{children}</>;
  }

  // If the sidebar is collapsed, wrap the children in a tooltip.
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

