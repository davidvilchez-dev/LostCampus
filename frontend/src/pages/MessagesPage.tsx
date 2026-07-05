import React, { useState, useEffect, useRef } from 'react';
import { getChats, getChatMessages, confirmDelivery, type ChatRoom, type ChatMessage } from '../api/chatService';
import useAuthStore from '../store/authStore';
import { Client } from '@stomp/stompjs';
import { toast } from 'react-toastify';
import { Send, Paperclip, Search, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function MessagesPage() {
  const { user, token } = useAuthStore();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Obtener listado de salas al cargar
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (selectRoomId?: number) => {
    try {
      setLoadingRooms(true);
      const data = await getChats();
      setRooms(data);

      if (selectRoomId) {
        const updatedActive = data.find((r) => r.id === selectRoomId);
        if (updatedActive) {
          setActiveRoom(updatedActive);
        }
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('No se pudieron cargar las conversaciones.');
    } finally {
      setLoadingRooms(false);
    }
  };

  // 2. Cargar mensajes cuando cambia de sala activa
  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const data = await getChatMessages(activeRoom.id);
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('No se pudo cargar el historial de mensajes.');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Configurar WebSocket para mensajes en tiempo real
    const wsUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
      .replace('/api', '/ws-chat')
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');

    const stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('STOMP Debug:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log('WebSocket Connected to Chat Room:', activeRoom.id);
      
      // Suscribirse a mensajes nuevos
      stompClient.subscribe(`/topic/chat/${activeRoom.id}`, (message) => {
        const receivedMessage: ChatMessage = JSON.parse(message.body);
        setMessages((prev) => {
          // Evitar duplicados si por alguna razón llega el propio mensaje enviado
          if (prev.some((m) => m.id === receivedMessage.id)) return prev;
          return [...prev, receivedMessage];
        });
      });

      // Suscribirse al cierre de la sala
      stompClient.subscribe(`/topic/chat/${activeRoom.id}/close`, (message) => {
        const closedRoom: ChatRoom = JSON.parse(message.body);
        setActiveRoom(closedRoom);
        // Actualizar el estado en la lista lateral
        setRooms((prevRooms) =>
          prevRooms.map((r) => (r.id === closedRoom.id ? { ...r, activo: false, reporte_estado: 'RECUPERADO' } : r))
        );
        toast.success('¡Caso cerrado! Entrega confirmada.');
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      toast.error('Error de conexión en tiempo real.');
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [activeRoom?.id, token]);

  // 3. Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Enviar mensaje
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !stompClientRef.current?.connected) return;

    try {
      stompClientRef.current.publish({
        destination: `/app/chat.sendMessage/${activeRoom.id}`,
        body: JSON.stringify({ contenido: newMessage.trim() }),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error publishing STOMP message:', error);
      toast.error('Error al enviar mensaje.');
    }
  };

  // 5. Confirmar entrega del objeto (abre modal de confirmación)
  const handleConfirmDelivery = () => {
    setIsConfirmModalOpen(true);
  };

  const handleExecuteConfirmDelivery = async () => {
    if (!activeRoom) return;
    setIsConfirmingDelivery(true);
    try {
      const updatedRoom = await confirmDelivery(activeRoom.id);
      setActiveRoom(updatedRoom);
      fetchRooms(activeRoom.id);
      toast.success('¡Entrega confirmada exitosamente!');
      setIsConfirmModalOpen(false);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'No se pudo confirmar la entrega.';
      toast.error(msg);
    } finally {
      setIsConfirmingDelivery(false);
    }
  };

  // Helpers de renderizado
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Hoy';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Filtrar salas según búsqueda
  const filteredRooms = rooms.filter(
    (r) =>
      r.interlocutor_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporte_nombre_objeto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl border border-brand-border-dark bg-[#0a1122]/60 backdrop-blur-md overflow-hidden">
      
      {/* PANEL IZQUIERDO: LISTA DE CONVERSACIONES */}
      <div className="w-full md:w-80 border-r border-brand-border-dark flex flex-col h-full bg-[#0c1426]/70 shrink-0">
        <div className="p-4 border-b border-brand-border-dark">
          <h2 className="text-xl font-bold tracking-tight text-brand-text mb-3">Conversaciones</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              placeholder="Buscar mensajes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111c33]/70 text-sm pl-9 pr-4 py-2.5 rounded-xl border border-brand-border-dark/60 focus:border-brand-accent focus:outline-none placeholder:text-brand-muted transition-colors text-brand-text"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-brand-border-dark/30">
          {loadingRooms ? (
            <div className="p-6 text-center text-brand-muted text-sm">Cargando chats...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-6 text-center text-brand-muted text-sm">No se encontraron conversaciones.</div>
          ) : (
            filteredRooms.map((r) => {
              const isActive = activeRoom?.id === r.id;
              const hasLastMsg = !!r.ultimo_mensaje;
              const lastMsgTime = r.ultimo_mensaje_hora ? formatMessageTime(r.ultimo_mensaje_hora) : '';

              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRoom(r)}
                  className={`w-full text-left p-4 flex items-start space-x-3 transition-colors duration-150 cursor-pointer ${
                    isActive ? 'bg-brand-accent/15 border-l-4 border-brand-accent' : 'hover:bg-brand-card-hover/20'
                  }`}
                >
                  {/* Foto Interlocutor */}
                  <div className="shrink-0">
                    {r.interlocutor_foto_url ? (
                      <img
                        src={r.interlocutor_foto_url}
                        alt={r.interlocutor_nombre}
                        className="w-11 h-11 rounded-full object-cover border border-brand-border-dark/50"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-semibold text-sm">
                        {getInitials(r.interlocutor_nombre)}
                      </div>
                    )}
                  </div>

                  {/* Detalle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h4 className="text-sm font-bold truncate text-brand-text pr-2">
                        {r.interlocutor_nombre}
                      </h4>
                      {hasLastMsg && (
                        <span className="text-xxs text-brand-muted shrink-0">
                          {lastMsgTime}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-brand-accent block truncate mb-1">
                      {r.reporte_nombre_objeto}
                    </span>
                    <p className="text-xs text-brand-muted truncate">
                      {hasLastMsg ? r.ultimo_mensaje : 'No hay mensajes aún'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* PANEL DERECHO: INTERFAZ DE MENSAJES */}
      <div className="flex-1 flex flex-col h-full bg-[#090f1d]/50">
        {activeRoom ? (
          <>
            {/* Cabecera del Chat */}
            <div className="h-16 px-6 border-b border-brand-border-dark bg-[#0c1426]/60 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3.5 min-w-0">
                {activeRoom.reporte_imagen_url ? (
                  <img
                    src={activeRoom.reporte_imagen_url}
                    alt={activeRoom.reporte_nombre_objeto}
                    className="w-10 h-10 rounded-xl object-cover border border-brand-border-dark/50 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-brand-border-dark/40 border border-brand-border-dark/50 flex items-center justify-center text-brand-muted shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-brand-text truncate leading-tight">
                    {activeRoom.reporte_nombre_objeto}
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeRoom.activo ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                    <span className="text-xxs text-brand-muted font-medium">
                      Estado: {activeRoom.activo ? 'Pendiente de entrega' : 'Recuperado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de Confirmar Entrega */}
              {activeRoom.activo && user?.id === activeRoom.creador_reporte_id && (
                <button
                  onClick={handleConfirmDelivery}
                  className="bg-brand-accent hover:bg-brand-accent-hover text-brand-text px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar entrega</span>
                </button>
              )}
            </div>

            {/* Caja de Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="text-center text-brand-muted text-sm pt-10">Cargando mensajes...</div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="p-4 rounded-full bg-brand-accent/5 border border-brand-accent/15 mb-3">
                    <MessageSquare className="w-8 h-8 text-brand-accent/70" />
                  </div>
                  <h3 className="text-sm font-semibold text-brand-text">¡Inicia la conversación!</h3>
                  <p className="text-xs text-brand-muted max-w-xs mt-1">
                    Escribe tu primer mensaje para coordinar la entrega y verificar la propiedad.
                  </p>
                </div>
              ) : (
                messages.map((m, index) => {
                  const isOwn = m.remitente_id === user?.id;
                  const showDateSeparator =
                    index === 0 ||
                    formatDateLabel(m.created_at) !== formatDateLabel(messages[index - 1].created_at);

                  return (
                    <React.Fragment key={m.id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <span className="bg-[#121d33]/80 border border-brand-border-dark/50 text-brand-muted text-xxs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                            {formatDateLabel(m.created_at)}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
                        {/* Avatar para interlocutor */}
                        {!isOwn && (
                          <div className="shrink-0 mb-1">
                            {m.remitente_foto_url ? (
                              <img
                                src={m.remitente_foto_url}
                                alt={m.remitente_nombre}
                                className="w-8 h-8 rounded-full object-cover border border-brand-border-dark/30"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-semibold text-xxs">
                                {getInitials(m.remitente_nombre)}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="max-w-[70%]">
                          <div
                            className={`px-4.5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              isOwn
                                ? 'bg-brand-accent text-brand-text rounded-br-none'
                                : 'bg-[#18243e] text-brand-text border border-brand-border-dark/30 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap wrap-break-word">{m.contenido}</p>
                          </div>
                          <span
                            className={`text-xxs text-brand-muted mt-1 block px-1 ${
                              isOwn ? 'text-right' : 'text-left'
                            }`}
                          >
                            {formatMessageTime(m.created_at)}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar o Aviso de Sólo Lectura */}
            {!activeRoom.activo ? (
              <div className="p-4 border-t border-brand-border-dark bg-brand-border-dark/10 flex items-center justify-center space-x-2 text-brand-muted text-xs select-none">
                <AlertCircle className="w-4.5 h-4.5 text-brand-accent" />
                <span>El caso ha sido cerrado. Esta conversación es de solo lectura.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-brand-border-dark bg-[#0a1122]/80 flex items-center space-x-3 shrink-0"
              >
                <button
                  type="button"
                  className="p-2.5 rounded-xl bg-[#111c33]/70 hover:bg-brand-card-hover/40 text-brand-muted hover:text-brand-text transition-colors border border-brand-border-dark/50 cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-[#111c33]/70 text-sm px-4.5 py-3 rounded-xl border border-brand-border-dark/60 focus:border-brand-accent focus:outline-none placeholder:text-brand-muted transition-colors text-brand-text"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-xl transition-all duration-200 border cursor-pointer ${
                    newMessage.trim()
                      ? 'bg-brand-accent hover:bg-brand-accent-hover text-brand-text border-brand-accent'
                      : 'bg-brand-border-dark/20 text-brand-muted border-brand-border-dark/30 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
            <div className="w-16 h-16 rounded-3xl bg-brand-accent/5 border border-brand-accent/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-brand-accent/50" />
            </div>
            <h3 className="text-base font-bold text-brand-text">Coordinación de Entregas</h3>
            <p className="text-xs text-brand-muted max-w-xs mt-1">
              Selecciona uno de tus chats privados del panel izquierdo para chatear en tiempo real y coordinar los detalles.
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleExecuteConfirmDelivery}
        title="¿Confirmar entrega?"
        message="¿Estás seguro de confirmar la entrega? Esto marcará el objeto como RECUPERADO y el chat pasará a ser de SÓLO LECTURA."
        confirmText="Confirmar"
        cancelText="Cancelar"
        type="warning"
        isSubmitting={isConfirmingDelivery}
      />
    </div>
  );
}
