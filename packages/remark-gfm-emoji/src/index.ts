import { emojiFromMarkdown } from 'mdast-util-gfm-emoji';
import { emoji } from 'micromark-extension-gfm-emoji';
import type { Root } from 'mdast';
import type { Processor, Plugin } from 'unified';
import type {} from 'remark-parse';
import type {} from 'remark-stringify';
import type { Options } from 'micromark-extension-gfm-emoji';

const remarkGfmEmoji: Plugin<[Options?], Root> & ThisType<Processor<Root>> = function (opts = {}) {
  const data = this.data();

  const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);

  micromarkExtensions.push(emoji(opts));
  fromMarkdownExtensions.push(emojiFromMarkdown);
};

export default remarkGfmEmoji;
