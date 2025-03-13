import invariant from 'tiny-invariant';
import type { Literal, Data } from 'mdast';
import type { Extension, CompileContext } from 'mdast-util-from-markdown';
import type { Token } from 'micromark-util-types';
import type { ElementContent, Properties } from 'hast';

export type EmojiData = Data & {
  hChildren?: ElementContent[] | undefined;
  hName?: string | undefined;
  hProperties?: Properties | undefined;
};

export interface Emoji extends Literal {
  type: 'emoji';
  data?: EmojiData | undefined;
}

declare module 'mdast' {
  interface PhrasingContentMap {
    emoji: Emoji;
  }

  interface RootContentMap {
    emoji: Emoji;
  }
}

export const emojiFromMarkdown: Extension = {
  enter: {
    emoji: enterEmoji,
    emojiData: enterEmojiData,
  },
  exit: {
    emoji: exitEmoji,
    emojiData: exitEmojiData,
  },
};

function enterEmoji(this: CompileContext, token: Token) {
  const data = { hName: 'emoji', hProperties: {}, hChildren: [] };
  this.enter({ type: 'emoji', value: '', data }, token);
  this.buffer();
}

function enterEmojiData(this: CompileContext, token: Token) {
  this.config.enter.data.call(this, token);
}

function exitEmoji(this: CompileContext, token: Token) {
  const data = this.resume();
  const node = this.stack[this.stack.length - 1];
  invariant(node.type === 'emoji', 'Expected emoji');
  node.value = data;
  node.data?.hChildren?.push({ type: 'text', value: data });
  this.exit(token);
}

function exitEmojiData(this: CompileContext, token: Token) {
  this.config.exit.data.call(this, token);
}
