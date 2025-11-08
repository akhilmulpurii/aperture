import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

export interface ThemeOption {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];
