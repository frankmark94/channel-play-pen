
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Palette, RotateCcw } from 'lucide-react';

export const ThemeCustomizer = () => {
  const [primaryColor, setPrimaryColor] = useState('#1f2937');
  const [accentColor, setAccentColor] = useState('#3b82f6');

  const presetThemes = [
    { name: 'Pega Blue', primary: '#1f2937', accent: '#3b82f6' },
    { name: 'Pega Dark', primary: '#0f172a', accent: '#06b6d4' },
    { name: 'Corporate', primary: '#374151', accent: '#059669' },
    { name: 'Modern', primary: '#1e293b', accent: '#8b5cf6' },
  ];

  const applyTheme = (primary: string, accent: string) => {
    const root = document.documentElement;
    
    // Convert hex to HSL
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const primaryHsl = hexToHsl(primary);
    const accentHsl = hexToHsl(accent);

    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--sidebar-primary', primaryHsl);
    root.style.setProperty('--sidebar-accent', accentHsl);
    
    setPrimaryColor(primary);
    setAccentColor(accent);
  };

  const resetTheme = () => {
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--sidebar-primary');
    root.style.removeProperty('--sidebar-accent');
    setPrimaryColor('#1f2937');
    setAccentColor('#3b82f6');
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme Customizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color" className="text-sm font-medium">
              Primary Color
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => applyTheme(e.target.value, accentColor)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
                aria-label="Choose primary color"
              />
              <span className="text-sm text-muted-foreground font-mono">
                {primaryColor}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent-color" className="text-sm font-medium">
              Accent Color
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="accent-color"
                type="color"
                value={accentColor}
                onChange={(e) => applyTheme(primaryColor, e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
                aria-label="Choose accent color"
              />
              <span className="text-sm text-muted-foreground font-mono">
                {accentColor}
              </span>
            </div>
          </div>
        </div>

        {/* Preset Themes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Preset Themes</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {presetThemes.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                size="sm"
                onClick={() => applyTheme(theme.primary, theme.accent)}
                className="text-xs h-8"
              >
                {theme.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTheme}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
