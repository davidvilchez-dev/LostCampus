package com.david.backend.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import com.david.backend.dto.response.*;

import static org.junit.jupiter.api.Assertions.*;

public class ModelTest {

    @Test
    void testUsuarioModel() {
        Usuario u = Usuario.builder()
                .id(1L)
                .nombreCompleto("David")
                .correo("david@unsch.edu.pe")
                .contrasenaHash("hash")
                .fotoUrl("url")
                .esAdmin(true)
                .activo(true)
                .tokenRecuperacion("token")
                .tokenExpiracion(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        assertEquals(1L, u.getId());
        assertEquals("David", u.getNombreCompleto());
        assertEquals("david@unsch.edu.pe", u.getCorreo());
        assertEquals("hash", u.getContrasenaHash());
        assertEquals("url", u.getFotoUrl());
        assertTrue(u.getEsAdmin());
        assertTrue(u.getActivo());
        assertEquals("token", u.getTokenRecuperacion());
        assertNotNull(u.getTokenExpiracion());
        assertNotNull(u.getCreatedAt());
        assertNotNull(u.getUpdatedAt());

        // Setter
        u.setNombreCompleto("David Editado");
        assertEquals("David Editado", u.getNombreCompleto());
        
        // Constructor vacío
        Usuario empty = new Usuario();
        assertNull(empty.getId());

        // PreUpdate trigger
        u.onUpdate();
        assertNotNull(u.getUpdatedAt());
    }

    @Test
    void testCategoriaModel() {
        Categoria c = Categoria.builder()
                .id(1L)
                .nombre("Electrónica")
                .icono("phone")
                .build();

        assertEquals(1L, c.getId());
        assertEquals("Electrónica", c.getNombre());
        assertEquals("phone", c.getIcono());

        c.setNombre("Mochilas");
        assertEquals("Mochilas", c.getNombre());

        Categoria empty = new Categoria();
        assertNull(empty.getId());
    }

    @Test
    void testReporteModel() {
        Usuario u = new Usuario();
        Categoria c = new Categoria();
        Reporte r = Reporte.builder()
                .id(1L)
                .usuario(u)
                .categoria(c)
                .tipo("PERDIDO")
                .nombreObjeto("Laptop")
                .descripcion("Gris")
                .lugar("Pabellón")
                .fechaIncidente(LocalDate.now())
                .estado("ACTIVO")
                .imagenes(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        assertEquals(1L, r.getId());
        assertSame(u, r.getUsuario());
        assertSame(c, r.getCategoria());
        assertEquals("PERDIDO", r.getTipo());
        assertEquals("Laptop", r.getNombreObjeto());
        assertEquals("Gris", r.getDescripcion());
        assertEquals("Pabellón", r.getLugar());
        assertNotNull(r.getFechaIncidente());
        assertEquals("ACTIVO", r.getEstado());
        assertNotNull(r.getImagenes());
        assertNotNull(r.getCreatedAt());
        assertNotNull(r.getUpdatedAt());

        r.setEstado("CERRADO");
        assertEquals("CERRADO", r.getEstado());

        r.onUpdate();

        Reporte empty = new Reporte();
        assertNull(empty.getId());
    }

    @Test
    void testSolicitudReclamacionModel() {
        Usuario user = new Usuario();
        Reporte rep = new Reporte();
        SolicitudReclamacion sr = SolicitudReclamacion.builder()
                .id(1L)
                .reporte(rep)
                .reclamante(user)
                .mensajePrueba("Es mía")
                .estado(EstadoReclamacion.PENDIENTE)
                .createdAt(LocalDateTime.now())
                .build();

        assertEquals(1L, sr.getId());
        assertSame(rep, sr.getReporte());
        assertSame(user, sr.getReclamante());
        assertEquals("Es mía", sr.getMensajePrueba());
        assertEquals(EstadoReclamacion.PENDIENTE, sr.getEstado());
        assertNotNull(sr.getCreatedAt());

        sr.setEstado(EstadoReclamacion.ACEPTADA);
        assertEquals(EstadoReclamacion.ACEPTADA, sr.getEstado());

        SolicitudReclamacion empty = new SolicitudReclamacion();
        assertNull(empty.getId());
    }

    @Test
    void testHistorialEstadoReporteModel() {
        Reporte rep = new Reporte();
        HistorialEstadoReporte h = HistorialEstadoReporte.builder()
                .id(1L)
                .reporte(rep)
                .estadoAnterior("ACTIVO")
                .estadoNuevo("EN_PROCESO")
                .fechaCambio(LocalDateTime.now())
                .build();

        assertEquals(1L, h.getId());
        assertSame(rep, h.getReporte());
        assertEquals("ACTIVO", h.getEstadoAnterior());
        assertEquals("EN_PROCESO", h.getEstadoNuevo());
        assertNotNull(h.getFechaCambio());

        HistorialEstadoReporte empty = new HistorialEstadoReporte();
        assertNull(empty.getId());
    }

    @Test
    void testLogAuditoriaAdminModel() {
        Usuario admin = new Usuario();
        LogAuditoriaAdmin log = LogAuditoriaAdmin.builder()
                .id(1L)
                .admin(admin)
                .accion("CAMBIO_ESTADO")
                .reporteId(10L)
                .detalles("Detalles")
                .fechaAccion(LocalDateTime.now())
                .build();

        assertEquals(1L, log.getId());
        assertSame(admin, log.getAdmin());
        assertEquals("CAMBIO_ESTADO", log.getAccion());
        assertEquals(10L, log.getReporteId());
        assertEquals("Detalles", log.getDetalles());
        assertNotNull(log.getFechaAccion());

        LogAuditoriaAdmin empty = new LogAuditoriaAdmin();
        assertNull(empty.getId());
    }

    @Test
    void testChatMessageModel() {
        ChatRoom room = new ChatRoom();
        Usuario sender = new Usuario();
        ChatMessage msg = ChatMessage.builder()
                .id(1L)
                .chatRoom(room)
                .remitente(sender)
                .contenido("Hola")
                .createdAt(LocalDateTime.now())
                .build();

        assertEquals(1L, msg.getId());
        assertSame(room, msg.getChatRoom());
        assertSame(sender, msg.getRemitente());
        assertEquals("Hola", msg.getContenido());
        assertNotNull(msg.getCreatedAt());

        ChatMessage empty = new ChatMessage();
        assertNull(empty.getId());
    }

    @Test
    void testChatRoomModel() {
        Reporte r = new Reporte();
        Usuario u1 = new Usuario();
        Usuario u2 = new Usuario();
        ChatRoom room = ChatRoom.builder()
                .id(1L)
                .reporte(r)
                .creadorReporte(u1)
                .reclamante(u2)
                .activo(true)
                .createdAt(LocalDateTime.now())
                .build();

        assertEquals(1L, room.getId());
        assertSame(r, room.getReporte());
        assertSame(u1, room.getCreadorReporte());
        assertSame(u2, room.getReclamante());
        assertTrue(room.getActivo());
        assertNotNull(room.getCreatedAt());

        ChatRoom empty = new ChatRoom();
        assertNull(empty.getId());
    }

    @Test
    void testNotificacionModel() {
        Usuario u = new Usuario();
        Notificacion n = Notificacion.builder()
                .id(1L)
                .usuario(u)
                .titulo("Notificación")
                .mensaje("Mensaje")
                .leido(false)
                .tipo("TIPO")
                .enlace("enlace")
                .createdAt(LocalDateTime.now())
                .build();

        assertEquals(1L, n.getId());
        assertSame(u, n.getUsuario());
        assertEquals("Notificación", n.getTitulo());
        assertEquals("Mensaje", n.getMensaje());
        assertFalse(n.getLeido());
        assertEquals("TIPO", n.getTipo());
        assertEquals("enlace", n.getEnlace());
        assertNotNull(n.getCreatedAt());

        n.setLeido(true);
        assertTrue(n.getLeido());

        Notificacion empty = new Notificacion();
        assertNull(empty.getId());
    }

    @Test
    void testImagenReporteModel() {
        Reporte r = new Reporte();
        ImagenReporte img = ImagenReporte.builder()
                .id(1L)
                .reporte(r)
                .urlCloudinary("url")
                .publicIdCloudinary("publicId")
                .orden((short) 2)
                .createdAt(LocalDateTime.now())
                .build();

        assertEquals(1L, img.getId());
        assertSame(r, img.getReporte());
        assertEquals("url", img.getUrlCloudinary());
        assertEquals("publicId", img.getPublicIdCloudinary());
        assertEquals((short) 2, img.getOrden());
        assertNotNull(img.getCreatedAt());

        ImagenReporte empty = new ImagenReporte();
        assertNull(empty.getId());
    }

    @Test
    void testEstadoReclamacionEnum() {
        assertEquals("PENDIENTE", EstadoReclamacion.PENDIENTE.name());
        assertEquals("ACEPTADA", EstadoReclamacion.ACEPTADA.name());
        assertEquals("RECHAZADA", EstadoReclamacion.RECHAZADA.name());
    }

    @Test
    void testHistorialEstadoResponse() {
        Reporte r = Reporte.builder().id(99L).build();
        HistorialEstadoReporte h = HistorialEstadoReporte.builder()
                .id(1L)
                .reporte(r)
                .estadoAnterior("ACTIVO")
                .estadoNuevo("EN_PROCESO")
                .fechaCambio(LocalDateTime.now())
                .build();

        HistorialEstadoResponse resp = HistorialEstadoResponse.fromEntity(h);
        assertEquals(1L, resp.getId());
        assertEquals(99L, resp.getReporteId());
        assertEquals("ACTIVO", resp.getEstadoAnterior());
        assertEquals("EN_PROCESO", resp.getEstadoNuevo());
        assertNotNull(resp.getFechaCambio());
        
        // Constructors
        HistorialEstadoResponse empty = new HistorialEstadoResponse();
        assertNull(empty.getId());
    }
}
