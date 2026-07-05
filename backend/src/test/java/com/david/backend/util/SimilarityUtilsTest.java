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
}
