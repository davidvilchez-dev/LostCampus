package com.david.backend.util;

import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

public class SimilarityUtilsTest {

    @Test
    void tokenize_NullOrEmpty_ReturnsEmptySet() {
        assertTrue(SimilarityUtils.tokenize(null).isEmpty());
        assertTrue(SimilarityUtils.tokenize("").isEmpty());
        assertTrue(SimilarityUtils.tokenize("   ").isEmpty());
    }

    @Test
    void tokenize_ValidText_RemovesAccentsAndStopWords() {
        Set<String> tokens = SimilarityUtils.tokenize("El celular de David");
        assertTrue(tokens.contains("celular"));
        assertTrue(tokens.contains("david"));
        assertFalse(tokens.contains("el"));
        assertFalse(tokens.contains("de"));
    }

    @Test
    void calculateJaccardSimilarity_BothEmpty_ReturnsZero() {
        assertEquals(0.0, SimilarityUtils.calculateJaccardSimilarity("", ""));
        assertEquals(0.0, SimilarityUtils.calculateJaccardSimilarity(null, null));
    }

    @Test
    void calculateJaccardSimilarity_TypicalCase_ReturnsCorrectValue() {
        double sim = SimilarityUtils.calculateJaccardSimilarity("Mochila azul de David", "Una mochila roja de David");
        // tokens1: [mochila, azul, david]
        // tokens2: [mochila, roja, david]
        // intersection: [mochila, david] (2)
        // union: [mochila, azul, david, roja] (4)
        // similarity: 2/4 = 0.5
        assertEquals(0.5, sim, 0.001);
    }

    @Test
    void testConstructor() {
        assertNotNull(new SimilarityUtils());
    }

    @Test
    void tokenize_AccentCharacters_NormalizesCorrectly() {
        Set<String> tokens = SimilarityUtils.tokenize("\u00e1\u00e0\u00e4\u00e2 \u00e9\u00e8\u00eb\u00ea \u00ed\u00ec\u00ef\u00ee \u00f3\u00f2\u00f6\u00f4 \u00fa\u00f9\u00fc\u00fb \u00f1");
        assertTrue(tokens.contains("aaaa"));
        assertTrue(tokens.contains("eeee"));
        assertTrue(tokens.contains("iiii"));
        assertTrue(tokens.contains("oooo"));
        assertTrue(tokens.contains("uuuu"));
        assertTrue(tokens.contains("\u00f1"));
    }
}
