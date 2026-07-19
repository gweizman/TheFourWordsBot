import fc from "fast-check";
import { expect, test } from "vitest";

import { getResponse } from "../src/index.js";

// Valid separators: Unicode category Z characters (Zs, Zl, Zp) plus
// underscore — mirrors the alphabet the original Hypothesis tests used.
const SEP_CHARS = [
  0x0020, 0x00a0, 0x1680,
  0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005,
  0x2006, 0x2007, 0x2008, 0x2009, 0x200a,
  0x2028, 0x2029, 0x202f, 0x205f, 0x3000,
  0x005f, // underscore
].map((cp) => String.fromCodePoint(cp));

const sepChar = fc.constantFrom(...SEP_CHARS);

const wordChar = fc
  .integer({ min: 0x21, max: 0x10ffff })
  .filter((cp) => cp < 0xd800 || cp > 0xdfff)
  .map((cp) => String.fromCodePoint(cp))
  .filter((c) => !/[\s_]/.test(c));

const word = fc.string({ unit: wordChar, minLength: 1 });

// A message of exactly n words, with random separators between them and
// optionally-empty leading/trailing separators.
const message = (n, gerbil = false) =>
  fc
    .tuple(
      fc.array(word, { minLength: n, maxLength: n }),
      fc.array(fc.string({ unit: sepChar, minLength: 1 }), {
        minLength: n - 1,
        maxLength: n - 1,
      }),
      fc.string({ unit: sepChar }),
      fc.string({ unit: sepChar }),
      fc.nat({ max: n - 1 })
    )
    .map(([words, seps, lead, trail, gerbilIndex]) => {
      if (gerbil) {
        words[gerbilIndex] = "גרביל";
      }
      const body = words
        .map((w, i) => w + (i < seps.length ? seps[i] : ""))
        .join("");
      return lead + body + trail;
    })
    .filter((msg) => gerbil || !msg.includes("גרביל"));

test("four words get no response", () => {
  fc.assert(
    fc.property(message(4), (msg) => {
      expect(getResponse(msg)).toBeNull();
    })
  );
});

test("three words are not four words", () => {
  fc.assert(
    fc.property(message(3), (msg) => {
      expect(getResponse(msg)).toBe("זה לא ארבע מילים");
    })
  );
});

test("five words are not four words", () => {
  fc.assert(
    fc.property(message(5), (msg) => {
      expect(getResponse(msg)).toBe("זה לא ארבע מילים");
    })
  );
});

test("gerbil is not four words", () => {
  fc.assert(
    fc.property(message(4, true), (msg) => {
      expect(getResponse(msg)).toBe("זה לא ארבע גרביל");
    })
  );
});
