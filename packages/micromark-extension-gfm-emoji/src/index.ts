import { codes, types } from 'micromark-util-symbol';
import invariant from 'tiny-invariant';
import type { Code, TokenizeContext, State, Effects, Extension } from 'micromark-util-types';

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    emoji: 'emoji';
    emojiData: 'emojiData';
    emojiSequence: 'emojiSequence';
  }
}

function previous(this: TokenizeContext, code: Code) {
  // If there is a previous code, there will always be a tail.
  return (
    code !== codes.colon || this.events[this.events.length - 1][1].type === types.characterEscape
  );
}

// [0-9a-z\+\-\_]+
const TEXT_CODES: number[] = [
  codes.digit0,
  codes.digit1,
  codes.digit2,
  codes.digit3,
  codes.digit4,
  codes.digit5,
  codes.digit6,
  codes.digit7,
  codes.digit8,
  codes.digit9,
  codes.lowercaseA,
  codes.lowercaseB,
  codes.lowercaseC,
  codes.lowercaseD,
  codes.lowercaseE,
  codes.lowercaseF,
  codes.lowercaseG,
  codes.lowercaseH,
  codes.lowercaseI,
  codes.lowercaseJ,
  codes.lowercaseK,
  codes.lowercaseL,
  codes.lowercaseM,
  codes.lowercaseN,
  codes.lowercaseO,
  codes.lowercaseP,
  codes.lowercaseQ,
  codes.lowercaseR,
  codes.lowercaseS,
  codes.lowercaseT,
  codes.lowercaseU,
  codes.lowercaseV,
  codes.lowercaseW,
  codes.lowercaseX,
  codes.lowercaseY,
  codes.lowercaseZ,
  codes.plusSign,
  codes.dash,
  codes.underscore,
];

function emojiTokenizer(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  let sizeOpen = 0;
  let size: number;
  return start;

  /**
   * Start of emoji (text).
   *
   * ```markdown
   * > | :smile:
   *     ^
   * > | :smile:
   *      ^
   * ```
   */
  function start(code: Code): State | undefined {
    invariant(code === codes.colon, 'Expected `:`');
    invariant(previous.call(self, self.previous), 'expected correct previous');
    effects.enter('emoji');
    effects.enter('emojiSequence');
    return sequenceOpen(code);
  }

  /**
   * In opening sequence.
   *
   * ```markdown
   * > | :smile:
   *     ^
   * ```
   */
  function sequenceOpen(code: Code): State | undefined {
    if (code === codes.colon) {
      effects.consume(code);
      sizeOpen++;
      return sequenceOpen;
    }
    // // Not enough markers in the sequence.
    // const single = true;
    // if (sizeOpen < 2 && !single) {
    //   return nok(code);
    // }
    effects.exit('emojiSequence');
    return between(code);
  }

  /**
   * Between something and something else.
   *
   * ```markdown
   * > | :smile:
   *      ^^^^^^
   * ```
   */
  function between(code: Code): State | undefined {
    if (code === codes.eof) {
      return nok(code);
    }

    if (code === codes.colon) {
      effects.enter('emojiSequence');
      size = 0;
      return sequenceClose(code);
    }

    if (!TEXT_CODES.includes(code)) {
      return nok(code);
    }

    effects.enter('emojiData');
    return data(code);
  }

  /**
   * In data.
   *
   * ```markdown
   * > | :smile:
   *      ^^^^^
   * ```
   */
  function data(code: Code): State | undefined {
    if (code === codes.eof || code === codes.colon) {
      effects.exit('emojiData');
      return between(code);
    }
    effects.consume(code);
    return data;
  }

  /**
   * In closing sequence.
   *
   * ```markdown
   * > | :smile:
   *           ^
   * ```
   */
  function sequenceClose(code: Code): State | undefined {
    // More.
    if (code === codes.colon) {
      effects.consume(code);
      size++;
      return sequenceClose;
    }

    // Done!
    if (size === sizeOpen) {
      effects.exit('emojiSequence');
      effects.exit('emoji');
      return ok(code);
    }

    // More or less accents: mark as data.
    return data(code);
  }
}

export const emoji: Extension = {
  text: {
    [codes.colon]: {
      name: 'emoji',
      previous,
      tokenize: emojiTokenizer,
    },
  },
};
