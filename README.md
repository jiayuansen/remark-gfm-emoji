# remark-gfm-emoji

A remark plugin that adds GitHub emoji syntax support to your markdown parser. Unlike other emoji plugins that directly convert emoji shortcodes to characters, this plugin preserves emoji nodes in the AST with `type: 'emoji'`, allowing for custom rendering of different emoji variants (Twitter, Google, Facebook, etc.).

## Installation

```shell
npm install remark-gfm-emoji
```

## Usage

```ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkGfmEmoji from 'remark-gfm-emoji';

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkGfmEmoji);

const ast = processor.parse(':smile:');
console.log(ast);
```

```json
{
  "type": "root",
  "children": [
    {
      "type": "paragraph",
      "children": [
        {
          "type": "emoji",
          "value": "smile",
          "data": {
            "hName": "emoji",
            "hProperties": {},
            "hChildren": [{ "type": "text", "value": "smile" }]
          },
          ...
        }
      ],
      ...
    }
  ],
  ...
}
```

### With ReactMarkdown

emoji.tsx

```tsx
import clsx from 'clsx';
import * as emoji from 'node-emoji';
import type { ReactNode } from 'react';

type EmojiProps = {
  className?: string;
  children: string;
};

export type EmojiComponents = {
  emoji: (props: EmojiProps) => ReactNode;
};

export function Emoji({ children, className = 'size-5' }: EmojiProps) {
  const value = emoji.get(text) ?? '💔';
  return <span className="size-5">{value}</span>;
}
```

markdown.tsx

```tsx
import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import Emoji, { EmojiComponents } from './emoji';

const components: Partial<Components & EmojiComponents> = {
  emoji: Emoji,
  // other components...
};

const Markdown = ({ children, className }: { children: string; className?: string }) => {
  const { theme } = useTheme();
  return (
    <div className={className}>
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm, remarkGfmEmoji]}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default memo(Markdown, (prev, next) => prev.children === next.children);
```

### Custom rendering

1. Get google(Apache 2.0)/twitter(CC4) emoji image from [emoji-data](https://github.com/iamcal/emoji-data).
2. Upolad emoji images to your storage(s3) + CDN.
3. Convert emoji to utf32 code

   ```ts
   import * as emoji from 'node-emoji';

   export function emojiUrl(text: string) {
     const value = emoji.get(text) ?? '💔';
     const utf32 = [...value]
       .map((char) => char.codePointAt(0)?.toString(16).padStart(4, '0'))
       .join('-');
     return `https://cdn.my-website.com/emojis/google/png/64/${utf32}.png`;
   }
   ```

4. Custom rendering

   ```tsx
   export function Emoji({ children, className }: EmojiProps) {
     return (
       <img
         width={20}
         height={20}
         alt={children}
         src={emojiUrl(children)}
         className={clsx('inline-block size-5', className)}
       />
     );
   }
   ```
