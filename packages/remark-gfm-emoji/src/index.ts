import { emojiFromMarkdown } from 'mdast-util-gfm-emoji';
import { emoji } from 'micromark-extension-gfm-emoji';
import type { Root } from 'mdast';
import type { Processor, Plugin } from 'unified';
import type {} from 'remark-parse';
import type {} from 'remark-stringify';

export const remarkGfmEmoji: Plugin<[], Root> & ThisType<Processor<Root>> = function () {
  const data = this.data();

  const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);

  micromarkExtensions.push(emoji);
  fromMarkdownExtensions.push(emojiFromMarkdown);
};
