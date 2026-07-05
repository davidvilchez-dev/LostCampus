package com.david.backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
        ResponseEntity<Map<String, Object>> response = handler.handleResourceNotFoundException(ex);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Not found", response.getBody().get("error"));
    }

    @Test
    void handleRuntimeException() {
        RuntimeException ex = new RuntimeException("Bad request error");
        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Bad request error", response.getBody().get("error"));
    }

    @Test
    void handleAccessDeniedException() {
        org.springframework.security.access.AccessDeniedException ex = 
            new org.springframework.security.access.AccessDeniedException("Access denied");
        ResponseEntity<Map<String, Object>> response = handler.handleAccessDeniedException(ex);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Access denied", response.getBody().get("error"));
    }

    @Test
    void handleGenericException() {
        Exception ex = new Exception("Internal error");
        ResponseEntity<Map<String, Object>> response = handler.handleGenericException(ex);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Error interno del servidor.", response.getBody().get("error"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void handleValidationExceptions() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("object", "field", "defaultMessage");
        
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(Collections.singletonList(fieldError));

        ResponseEntity<Map<String, Object>> response = handler.handleValidationExceptions(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertNotNull(errors);
        assertEquals("defaultMessage", errors.get("field"));
    }
}
