package com.david.backend.config;

import com.david.backend.repository.CategoriaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DataSeederTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private com.david.backend.repository.UsuarioRepository usuarioRepository;

    @InjectMocks
    private DataSeeder dataSeeder;

    @Test
    void run_EmptyDatabase_SeedsCategories() {
        when(categoriaRepository.count()).thenReturn(0L);
        when(usuarioRepository.findAll()).thenReturn(new java.util.ArrayList<>());

        dataSeeder.run();

        verify(categoriaRepository, times(8)).save(any());
    }

    @Test
    void run_DatabaseAlreadySeeded_DoesNothing() {
        when(categoriaRepository.count()).thenReturn(8L);
        when(usuarioRepository.findAll()).thenReturn(new java.util.ArrayList<>());

        dataSeeder.run();

        verify(categoriaRepository, never()).save(any());
    }
}
