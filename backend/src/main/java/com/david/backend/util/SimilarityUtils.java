package com.david.backend.util;

import java.util.*;

public class SimilarityUtils {

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
        "de", "la", "el", "en", "y", "a", "los", "del", "se", "las", "un", "para", "con", "no", 
        "una", "su", "al", "lo", "como", "mas", "pero", "sus", "este", "o", "por", "le", "esta", 
        "estos", "estas", "unos", "unas", "sobre", "otro", "otra", "otros", "otras", "mi", "mis",
        "tu", "tus", "su", "sus", "que", "es", "son", "un", "una"
    ));

    /**
     * Normaliza y tokeniza un texto en español, removiendo acentos, 
     * caracteres especiales y stop-words.
     */
    public static Set<String> tokenize(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Collections.emptySet();
        }

        // Convertir a minúsculas y normalizar caracteres
        String normalized = text.toLowerCase()
                .replaceAll("[\u00e1\u00e0\u00e4\u00e2]", "a")
                .replaceAll("[\u00e9\u00e8\u00eb\u00ea]", "e")
                .replaceAll("[\u00ed\u00ec\u00ef\u00ee]", "i")
                .replaceAll("[\u00f3\u00f2\u00f6\u00f4]", "o")
                .replaceAll("[\u00fa\u00f9\u00fc\u00fb]", "u")
                .replaceAll("[^a-z0-9\u00f1 ]", " "); // Remover caracteres especiales excepto ñ y números

        String[] words = normalized.split("\\s+");
        Set<String> tokens = new HashSet<>();

        for (String word : words) {
            String cleanWord = word.trim();
            if (!cleanWord.isEmpty() && !STOP_WORDS.contains(cleanWord)) {
                tokens.add(cleanWord);
            }
        }

        return tokens;
    }

    /**
     * Calcula el coeficiente de similitud de Jaccard entre dos textos.
     */
    public static double calculateJaccardSimilarity(String text1, String text2) {
        Set<String> tokens1 = tokenize(text1);
        Set<String> tokens2 = tokenize(text2);

        if (tokens1.isEmpty() && tokens2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);

        Set<String> union = new HashSet<>(tokens1);
        union.addAll(tokens2);

        return (double) intersection.size() / union.size();
    }
}
