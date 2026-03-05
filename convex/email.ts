import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendVerificationEmail = internalAction({
    args: { email: v.string(), code: v.string() },
    handler: async (ctx, args) => {
        // Initialize Resend with the API key from Convex environment variables
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error("RESEND_API_KEY environment variable not set. Skipping email sending.");
            // We don't throw to avoid crashing the user creation flow if env var is missing during setup
            return;
        }

        const resend = new Resend(apiKey);

        try {
            await resend.emails.send({
                from: "Punto de Partida <onboarding@resend.dev>", // Replace with your verified domain when going to production
                to: args.email,
                subject: "Código de verificación - Punto de Partida",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Verifica tu cuenta</h2>
                        <p>Gracias por registrarte en Punto de Partida. Usa el siguiente código para verificar tu cuenta:</p>
                        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">${args.code}</span>
                        </div>
                        <p>Este código expira en 15 minutos.</p>
                        <p>Si no solicitaste esta cuenta, ignora este correo.</p>
                    </div>
                `,
            });
            console.log("Verification email sent to", args.email);
        } catch (error) {
            console.error("Failed to send verification email", error);
            // Don't throw to not break user creation in case of email failure, just log it.
        }
    },
});
