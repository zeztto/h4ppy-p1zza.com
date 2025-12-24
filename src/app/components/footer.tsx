import { Button } from "./ui/button";
import { Github, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="text-center pt-12 border-t border-border">
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('https://github.com/zeztto', '_blank')}
        >
          <Github className="h-4 w-4 mr-2" />
          GitHub
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('https://instagram.com/h4ppy_p1zza', '_blank')}
        >
          <Instagram className="h-4 w-4 mr-2" />
          Instagram
        </Button>
      </div>
      <p className="text-muted-foreground">
        © 2025 h4ppy p1zza. All rights reserved.
      </p>
    </footer>
  );
}
