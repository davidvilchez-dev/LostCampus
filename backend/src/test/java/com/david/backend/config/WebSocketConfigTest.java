package com.david.backend.config;

import com.david.backend.model.Usuario;
import com.david.backend.repository.UsuarioRepository;
import com.david.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;
import org.springframework.web.socket.config.annotation.SockJsServiceRegistration;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebSocketConfigTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private MessageBrokerRegistry messageBrokerRegistry;

    @Mock
    private StompEndpointRegistry stompEndpointRegistry;

    @Mock
    private StompWebSocketEndpointRegistration endpointRegistration;

    @Mock
    private SockJsServiceRegistration sockJsServiceRegistration;

    @Mock
    private ChannelRegistration channelRegistration;

    @Mock
    private MessageChannel messageChannel;

    private WebSocketConfig webSocketConfig;

    @BeforeEach
    void setUp() {
        webSocketConfig = new WebSocketConfig(jwtTokenProvider, usuarioRepository);
    }

    @Test
    void configureMessageBroker_ShouldSetBrokerAndPrefix() {
        webSocketConfig.configureMessageBroker(messageBrokerRegistry);

        verify(messageBrokerRegistry).enableSimpleBroker("/topic");
        verify(messageBrokerRegistry).setApplicationDestinationPrefixes("/app");
    }

    @Test
    void registerStompEndpoints_ShouldRegisterChatEndpointWithSockJs() {
        when(stompEndpointRegistry.addEndpoint("/ws-chat")).thenReturn(endpointRegistration);
        when(endpointRegistration.setAllowedOriginPatterns("*")).thenReturn(endpointRegistration);
        when(endpointRegistration.withSockJS()).thenReturn(sockJsServiceRegistration);

        webSocketConfig.registerStompEndpoints(stompEndpointRegistry);

        verify(stompEndpointRegistry, times(2)).addEndpoint("/ws-chat");
        verify(endpointRegistration, times(2)).setAllowedOriginPatterns("*");
        verify(endpointRegistration).withSockJS();
    }

    @Test
    void configureClientInboundChannel_WithValidBearerToken_ShouldAttachUser() {
        ArgumentCaptor<org.springframework.messaging.support.ChannelInterceptor> captor = ArgumentCaptor
                .forClass(org.springframework.messaging.support.ChannelInterceptor.class);
        Usuario usuario = Usuario.builder().id(7L).nombreCompleto("David Test").correo("david@unsch.edu.pe").build();

        when(jwtTokenProvider.isTokenValid("valid-token")).thenReturn(true);
        when(jwtTokenProvider.extractEmail("valid-token")).thenReturn("david@unsch.edu.pe");
        when(usuarioRepository.findByCorreo("david@unsch.edu.pe")).thenReturn(Optional.of(usuario));
        when(channelRegistration.interceptors(any())).thenReturn(channelRegistration);

        webSocketConfig.configureClientInboundChannel(channelRegistration);

        verify(channelRegistration).interceptors(captor.capture());

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("Authorization", "Bearer valid-token");
        accessor.setLeaveMutable(true);
        var message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        var result = captor.getValue().preSend(message, messageChannel);

        assertNotNull(result);
        StompHeaderAccessor resultAccessor = MessageHeaderAccessor.getAccessor(result, StompHeaderAccessor.class);
        assertNotNull(resultAccessor);
        assertInstanceOf(UsernamePasswordAuthenticationToken.class, resultAccessor.getUser());
    }

    @Test
    void configureClientInboundChannel_WithInvalidToken_ShouldLeaveUserNull() {
        ArgumentCaptor<org.springframework.messaging.support.ChannelInterceptor> captor = ArgumentCaptor
                .forClass(org.springframework.messaging.support.ChannelInterceptor.class);
        when(channelRegistration.interceptors(any())).thenReturn(channelRegistration);

        webSocketConfig.configureClientInboundChannel(channelRegistration);
        verify(channelRegistration).interceptors(captor.capture());

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("Authorization", "Bearer invalid-token");
        accessor.setLeaveMutable(true);
        var message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        var result = captor.getValue().preSend(message, messageChannel);

        assertNotNull(result);
        StompHeaderAccessor resultAccessor = MessageHeaderAccessor.getAccessor(result, StompHeaderAccessor.class);
        assertNotNull(resultAccessor);
        assertNull(resultAccessor.getUser());
    }
}