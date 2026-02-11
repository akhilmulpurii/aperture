import { cn } from "../../lib/utils";
import { CheckCircle, TrendingUp, Video, Globe } from "lucide-react";
import { Progress } from "../../components/ui/progress";

export interface BentoItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: string;
  tags?: string[];
  meta?: string;
  cta?: string;
  colSpan?: number;
  hasPersistentHover?: boolean;
  progress?: number;
}

interface BentoGridProps {
  items: BentoItem[];
}

const itemsSample: BentoItem[] = [
  {
    title: "Analytics Dashboard",
    meta: "v2.4.1",
    description:
      "Real-time metrics with AI-powered insights and predictive analytics",
    icon: <TrendingUp className="w-4 h-4 text-primary" />,
    status: "Live",
    tags: ["Statistics", "Reports", "AI"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Task Manager",
    meta: "84 completed",
    description: "Automated workflow management with priority scheduling",
    icon: <CheckCircle className="w-4 h-4 text-primary" />,
    status: "Updated",
    tags: ["Productivity", "Automation"],
  },
  {
    title: "Media Library",
    meta: "12GB used",
    description: "Cloud storage with intelligent content processing",
    icon: <Video className="w-4 h-4 text-primary" />,
    tags: ["Storage", "CDN"],
    colSpan: 2,
  },
  {
    title: "Global Network",
    meta: "6 regions",
    description: "Multi-region deployment with edge computing",
    icon: <Globe className="w-4 h-4 text-primary" />,
    status: "Beta",
    tags: ["Infrastructure", "Edge"],
  },
];

function BentoGrid({ items = itemsSample }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-7xl">
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
            "border border-border/60 bg-card text-card-foreground shadow-sm",
            "hover:-translate-y-0.5 hover:shadow-md will-change-transform",
            item.colSpan || "col-span-1",
            item.colSpan === 2 ? "md:col-span-2" : "",
            item.hasPersistentHover && "shadow-md -translate-y-0.5",
          )}
        >
          <div
            className={`absolute inset-0 ${
              item.hasPersistentHover
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } transition-opacity duration-300`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[4px_4px]" />
          </div>

          <div className="relative flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted/40 text-color-1 transition-all duration-300 group-hover:bg-muted/60">
                {item.icon}
              </div>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                  "bg-secondary/60 text-secondary-foreground",
                  "transition-colors duration-300 group-hover:bg-secondary",
                )}
              >
                {item.status || "Active"}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-foreground tracking-tight text-[15px]">
                {item.title}
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  {item.meta}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground leading-snug font-[425]">
                {item.description}
              </p>
            </div>

            {item.progress !== undefined && (
              <div className="flex items-center gap-3 mt-3">
                <Progress value={item.progress} className="flex-1 h-2" />
                <span className="text-xs font-medium text-muted-foreground font-mono min-w-10">
                  {item.progress.toFixed(1)}%
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {item.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-md bg-muted/30 text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:bg-muted/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {item.cta}
              </span>
            </div>
          </div>

          <div
            className={`absolute inset-0 -z-10 rounded-xl p-px bg-linear-to-br from-transparent via-border/30 to-transparent ${
              item.hasPersistentHover
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } transition-opacity duration-300`}
          />
        </div>
      ))}
    </div>
  );
}

export { BentoGrid };
