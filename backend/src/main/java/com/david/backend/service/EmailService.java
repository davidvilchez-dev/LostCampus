package com.david.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Envía el código de verificación de cuenta (6 dígitos).
     */
    @Async
    public void enviarCodigoVerificacion(String destinatario, String codigo) {
        String subject = "Verifica tu cuenta — LostCampus";
        String html = """
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
                  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px;">🔍 LostCampus</h1>
                    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Verificación de cuenta</p>
                  </div>
                  <div style="padding:32px 24px;text-align:center;">
                    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Tu código de verificación es:</p>
                    <div style="background:#1e293b;border:2px dashed #6366f1;border-radius:12px;padding:20px;margin:0 auto;max-width:240px;">
                      <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#f1f5f9;">%s</span>
                    </div>
                    <p style="color:#64748b;font-size:12px;margin:20px 0 0;">Este código expira en <strong style="color:#f59e0b;">15 minutos</strong>.</p>
                    <p style="color:#475569;font-size:11px;margin:16px 0 0;">Si no solicitaste esta verificación, puedes ignorar este correo.</p>
                  </div>
                  <div style="background:#0b1120;padding:16px 24px;text-align:center;">
                    <p style="color:#475569;font-size:11px;margin:0;">© %d LostCampus — Plataforma de objetos perdidos</p>
                  </div>
                </div>
                """.formatted(codigo, java.time.Year.now().getValue());

        enviarHtml(destinatario, subject, html);
    }

    /**
     * Envía el enlace/token de recuperación de contraseña.
     */
    @Async
    public void enviarRecuperacionContrasena(String destinatario, String token) {
        String resetUrl = "http://localhost:5173/restablecer?token=" + token;
        String subject = "Recupera tu contraseña — LostCampus";
        String html = """
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
                  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px;">🔍 LostCampus</h1>
                    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Recuperación de contraseña</p>
                  </div>
                  <div style="padding:32px 24px;text-align:center;">
                    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Haz clic en el botón para restablecer tu contraseña:</p>
                    <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">Restablecer contraseña</a>
                    <p style="color:#64748b;font-size:12px;margin:20px 0 0;">Este enlace expira en <strong style="color:#f59e0b;">15 minutos</strong>.</p>
                    <p style="color:#475569;font-size:11px;margin:16px 0 0;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
                  </div>
                  <div style="background:#0b1120;padding:16px 24px;text-align:center;">
                    <p style="color:#475569;font-size:11px;margin:0;">© %d LostCampus — Plataforma de objetos perdidos</p>
                  </div>
                </div>
                """.formatted(resetUrl, java.time.Year.now().getValue());

        enviarHtml(destinatario, subject, html);
    }

    /**
     * Envía una notificación general por correo (reclamos, estados, etc.).
     */
    @Async
    public void enviarNotificacion(String destinatario, String titulo, String mensaje) {
        String subject = titulo + " — LostCampus";
        String html = """
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
                  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:24px;">🔍 LostCampus</h1>
                  </div>
                  <div style="padding:28px 24px;">
                    <h2 style="color:#f1f5f9;font-size:18px;margin:0 0 12px;">%s</h2>
                    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0;">%s</p>
                    <div style="margin-top:24px;text-align:center;">
                      <a href="http://localhost:5173/feed" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:13px;">Ir a LostCampus</a>
                    </div>
                  </div>
                  <div style="background:#0b1120;padding:16px 24px;text-align:center;">
                    <p style="color:#475569;font-size:11px;margin:0;">© %d LostCampus</p>
                  </div>
                </div>
                """.formatted(titulo, mensaje, java.time.Year.now().getValue());

        enviarHtml(destinatario, subject, html);
    }

    /**
     * Método interno para enviar correos HTML con MimeMessage.
     */
    private void enviarHtml(String destinatario, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(destinatario);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            log.info("Correo enviado a {}: {}", destinatario, subject);
        } catch (MessagingException e) {
            log.error("Error al enviar correo a {}: {}", destinatario, e.getMessage());
        }
    }
}
