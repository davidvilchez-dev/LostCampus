package com.david.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private CloudinaryService cloudinaryService;

    @BeforeEach
    void setUp() {
        lenient().when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Test
    void uploadImage_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", "bytes".getBytes());
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("url", "http://cloudinary.com/image.png");
        mockResponse.put("public_id", "folder/image");

        when(uploader.upload(any(byte[].class), any(Map.class))).thenReturn(mockResponse);

        Map<String, Object> result = cloudinaryService.uploadImage(file, "folder");

        assertNotNull(result);
        assertEquals("http://cloudinary.com/image.png", result.get("url"));
        assertEquals("folder/image", result.get("public_id"));
    }

    @Test
    void deleteImage_Success() throws IOException {
        Map<String, Object> mockResponse = new HashMap<>();
        when(uploader.destroy(eq("publicId"), any(Map.class))).thenReturn(mockResponse);

        cloudinaryService.deleteImage("publicId");

        verify(uploader, times(1)).destroy(eq("publicId"), any(Map.class));
    }
}
