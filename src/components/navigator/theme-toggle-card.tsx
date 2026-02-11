"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "../../lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { THEME_OPTIONS } from "../../constants/theme-options";

interface ThemeToggleCardProps {
  className?: string;
  index?: number;
}

export const ThemeToggleCard: React.FC<ThemeToggleCardProps> = ({
  className,
  index = 0,
}) => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      <div
        className={cn(
          "transition duration-200 bg-card backdrop-blur-sm p-3 rounded-xl w-full",
          className,
        )}
      >
        <div className="flex gap-3 items-center w-full">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm leading-tight">
                  Theme Settings
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose your preferred theme
                </p>
              </div>
            </div>

            <div className="mt-3">
              <Tabs value={theme ?? "system"} onValueChange={handleThemeChange}>
                <TabsList className="grid w-full gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                  {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <TabsTrigger key={id} value={id} className="text-xs h-9">
                      <Icon className="h-3 w-3 mr-1" />
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
