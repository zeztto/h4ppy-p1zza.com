import { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LucideIcon } from 'lucide-react';
import * as icons from 'lucide-react';
import type { CustomSectionContent } from '@/app/lib/section-content-types';

function getIcon(name: string): LucideIcon {
  return (icons as unknown as Record<string, LucideIcon>)[name] ?? icons.HelpCircle;
}

interface CustomSectionRendererProps {
  content: CustomSectionContent;
  sectionId: string;
}

interface ShortcodeReplacement {
  token: string;
  type: 'divider' | 'spacer' | 'icon';
  attrs: Record<string, string>;
}

function parseShortcodes(text: string): { processed: string; replacements: ShortcodeReplacement[] } {
  const replacements: ShortcodeReplacement[] = [];
  let counter = 0;

  const processed = text.replace(/\[(\w+)([^\]]*)\]/g, (_match, tag: string, attrStr: string) => {
    const validTags = ['divider', 'spacer', 'icon'];
    if (!validTags.includes(tag)) return _match;

    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)=(?:"([^"]*)"|(\S+))/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      attrs[m[1]!] = m[2] ?? m[3] ?? '';
    }

    const token = `__SHORTCODE_${counter++}__`;
    replacements.push({ token, type: tag as ShortcodeReplacement['type'], attrs });
    return token;
  });

  return { processed, replacements };
}

function scopeCSS(css: string, sectionId: string): string {
  const scopeClass = `.section-${sectionId}`;
  // Prefix each CSS rule selector with the scope class
  return css.replace(
    /([^{}]+)\{/g,
    (_match, selectors: string) => {
      const scoped = selectors
        .split(',')
        .map((sel: string) => `${scopeClass} ${sel.trim()}`)
        .join(', ');
      return `${scoped} {`;
    },
  );
}

export function CustomSectionRenderer({ content, sectionId }: CustomSectionRendererProps) {
  const { processed, replacements } = useMemo(
    () => parseShortcodes(content.markdown),
    [content.markdown],
  );

  const scopedCSS = useMemo(
    () => (content.css ? scopeCSS(content.css, sectionId) : ''),
    [content.css, sectionId],
  );

  const renderShortcode = (replacement: ShortcodeReplacement) => {
    switch (replacement.type) {
      case 'divider':
        return <hr className="my-8 border-border" />;
      case 'spacer': {
        const height = replacement.attrs['height'] ?? '40';
        return <div style={{ height: `${height}px` }} />;
      }
      case 'icon': {
        const name = replacement.attrs['name'] ?? 'HelpCircle';
        const size = parseInt(replacement.attrs['size'] ?? '24', 10);
        const Icon = getIcon(name);
        return <Icon style={{ width: size, height: size }} />;
      }
      default:
        return null;
    }
  };

  return (
    <div className={`section-${sectionId}`}>
      {scopedCSS && <style>{scopedCSS}</style>}
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children, ...props }) => {
            // Check if children contain shortcode tokens
            const childArray = Array.isArray(children) ? children : [children];
            const hasShortcode = childArray.some(
              (child) =>
                typeof child === 'string' &&
                replacements.some((r) => child.includes(r.token)),
            );

            if (hasShortcode) {
              return (
                <div {...props}>
                  {childArray.map((child, i) => {
                    if (typeof child === 'string') {
                      const replacement = replacements.find((r) => child.includes(r.token));
                      if (replacement) {
                        // Split around the token and render
                        const parts = child.split(replacement.token);
                        return (
                          <span key={i}>
                            {parts[0]}
                            {renderShortcode(replacement)}
                            {parts[1]}
                          </span>
                        );
                      }
                    }
                    return <span key={i}>{child}</span>;
                  })}
                </div>
              );
            }

            return <p {...props}>{children}</p>;
          },
        }}
      >
        {processed}
      </Markdown>
    </div>
  );
}
