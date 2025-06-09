import { Injectable } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

@Injectable({
    providedIn: 'root',
})
export class EmailService {
    constructor() {}

    // usar asincronico; en .then salió todo bien
    async enviarCorreo(
        destinatarioNombre: string,
        direccionCorreo: string,
        asunto: string,
        cuerpo: string
    ): Promise<void> {
        console.log('Correo destinatario:', direccionCorreo);
        const templateParams = {
            to_name: destinatarioNombre,
            from_name: 'Angularianos',
            message: cuerpo,
            subject: asunto,
            logo_url:
                'https://hnlzagyadmtdaztbcwzd.supabase.co/storage/v1/object/public/logo//logo.jpeg',
            email: direccionCorreo,
        };

        try {
            const response: EmailJSResponseStatus = await emailjs.send(
                'angularianos2025',
                'template_ih5bwde',
                templateParams,
                '3dc1adopaWkwNRDFM'
            );
            console.log(
                'Correo enviado exitosamente!',
                response.status,
                response.text
            );
        } catch (error) {
            console.error('Error al enviar el correo:', error);
        }
    }
}