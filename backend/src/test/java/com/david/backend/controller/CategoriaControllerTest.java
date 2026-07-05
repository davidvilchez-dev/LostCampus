package com.david.backend.controller;

import com.david.backend.model.Categoria;
import com.david.backend.repository.CategoriaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CategoriaControllerTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private CategoriaController categoriaController;

    @Test
    void getAll_Success() {
        Categoria cat = Categoria.builder().id(1L).nombre("Electrónica").build();
        when(categoriaRepository.findAll()).thenReturn(Collections.singletonList(cat));

        ResponseEntity<List<Categoria>> response = categoriaController.getAll();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("Electrónica", response.getBody().get(0).getNombre());
    }
}
