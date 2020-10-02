import os

from hypothesis import given, assume
from hypothesis.strategies import characters, composite, lists, text, integers

os.environ["TELEGRAM_TOKEN"] = "lookatmytokenmytokenisamazing"
import handler


@composite
def fw(draw, n_words=4, gerbil=False):
    words = draw(
        lists(
            text(
                alphabet=characters(
                    blacklist_categories=("Z", "Cc"), blacklist_characters="_"
                ),
                min_size=1,
            ),
            min_size=n_words,
            max_size=n_words,
        )
    )
    if gerbil:
        words[draw(integers(min_value=0, max_value=n_words - 1))] = "גרביל"
    else:
        assume("גרביל" not in words)
    seps = draw(
        lists(
            text(
                alphabet=characters(
                    whitelist_categories=("Z"), whitelist_characters="_"
                ),
                min_size=1,
            ),
            min_size=n_words - 1,
            max_size=n_words - 1,
        )
    )
    possible_seps = draw(
        lists(
            text(
                alphabet=characters(
                    whitelist_categories=("Z"), whitelist_characters="_"
                ),
            ),
            min_size=2,
            max_size=2,
        )
    )
    result = possible_seps[0]
    result += "".join(sum(zip(words, seps), ()))
    result += words[-1] + possible_seps[1]
    return result


@given(fw())
def test_four_words(message):
    assert handler.get_response(message) is None


@given(fw(3))
def test_three_words(message):
    assert handler.get_response(message) == "זה לא ארבע מילים"


@given(fw(5))
def test_five_words(message):
    assert handler.get_response(message) == "זה לא ארבע מילים"


@given(fw(4, True))
def test_gerbil(message):
    assert handler.get_response(message) == "זה לא ארבע גרביל"
