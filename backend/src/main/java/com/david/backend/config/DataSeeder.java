package com.david.backend.config;

import com.david.backend.model.Categoria;
import com.david.backend.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoriaRepository categoriaRepository;

    @Override
    public void run(String... args) {
        if (categoriaRepository.count() == 0) {
            categoriaRepository.save(Categoria.builder().nombre("Electrónica").icono("smartphone").build());
            categoriaRepository.save(Categoria.builder().nombre("Documentos").icono("file-text").build());
            categoriaRepository.save(Categoria.builder().nombre("Ropa y Accesorios").icono("shirt").build());
            categoriaRepository.save(Categoria.builder().nombre("Llaves").icono("key").build());
            categoriaRepository.save(Categoria.builder().nombre("Billeteras y Carteras").icono("wallet").build());
            categoriaRepository.save(Categoria.builder().nombre("Mochilas y Bolsos").icono("backpack").build());
            categoriaRepository.save(Categoria.builder().nombre("Libros y Cuadernos").icono("book-open").build());
            categoriaRepository.save(Categoria.builder().nombre("Otros").icono("package").build());

            System.out.println("Categorías iniciales creadas correctamente.");
        }
    }
}
