// Use require('dotenv').config() APENAS para testes locais, NÃO para Vercel
// require('dotenv').config();

const nodemailer = require('nodemailer');
// Cors e Express não são mais estritamente necessários aqui para uma Serverless Function simples na Vercel
// A Vercel já gerencia o roteamento e o corpo da requisição.

// Configuração do Nodemailer - as credenciais virão das Vercel Environment Variables
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou 'outlook', 'hotmail', 'smtp.seu_provedor.com'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Esta é a função que a Vercel vai executar quando /api/send-email for acessado
module.exports = async (req, res) => {
    // A Vercel já parseia o corpo da requisição para você, então é só acessar req.body
    const { nome, email, telefone, produto, assunto, mensagem } = req.body;
    const targetEmail = process.env.TARGET_EMAIL;

    // Validar campos obrigatórios
    if (!nome || !email || !assunto || !mensagem) {
        return res.status(400).json({ error: 'Campos obrigatórios (Nome, E-mail, Assunto, Mensagem) estão faltando.' });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: targetEmail,
            subject: `Contato do Site - ${assunto}`,
            html: `
                <h3>Novo Contato do Formulário de Orçamento</h3>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
                <p><strong>Produto:</strong> ${produto || 'Não informado'}</p>
                <p><strong>Assunto:</strong> ${assunto}</p>
                <p><strong>Mensagem:</strong><br>${mensagem}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email enviado com sucesso!'); // Isso aparecerá nos logs da Vercel
        res.status(200).json({ message: 'E-mail enviado com sucesso!' });

    } catch (error) {
        console.error('Erro ao enviar e-mail:', error); // Isso aparecerá nos logs da Vercel
        res.status(500).json({ error: 'Erro ao enviar e-mail. Tente novamente mais tarde.' });
    }
};