# 🚗 FleetCare – Controle de Manutenção de Veículos

Sistema web para controle e histórico de manutenções da frota da empresa.

## ✨ Funcionalidades

- **Dashboard** com KPIs: total de manutenções, custo total, registros do mês e veículos cadastrados
- **Gráfico de custos** por tipo de serviço
- **Cadastro de manutenções** com data, tipo de serviço, custo, oficina, km e status
- **Cadastro de veículos** (modelo, placa, ano, cor, setor, responsável)
- **Filtros** por tipo de serviço e busca por texto
- **Editar e excluir** registros
- **Persistência local** via localStorage (sem necessidade de backend)
- Design responsivo — funciona no celular

## 🗂️ Estrutura

```
manutencao-veiculos/
├── index.html      # HTML principal
├── style.css       # Estilos (tema Azul Petróleo)
├── app.js          # Lógica da aplicação
├── vercel.json     # Configuração do Vercel
└── README.md       # Este arquivo
```

## 🚀 Deploy no Vercel

### Opção 1 – Via GitHub (recomendado)

1. Crie um repositório no GitHub e faça push desta pasta
2. Acesse [vercel.com](https://vercel.com) → **Add New Project**
3. Importe o repositório do GitHub
4. Clique em **Deploy** — pronto!

### Opção 2 – Via Vercel CLI

```bash
npm install -g vercel
cd manutencao-veiculos
vercel
```

Siga o assistente, aceite as configurações padrão e seu site estará online em segundos.

## 💡 Tecnologias

- HTML5 + CSS3 + JavaScript puro (sem frameworks)
- Fontes: Syne + DM Sans (Google Fonts)
- Persistência: localStorage
- Hospedagem: Vercel (site estático)

## 📋 Tipos de Serviço suportados

Preventiva · Corretiva · Revisão · Troca de Óleo · Pneus · Freios · Elétrica · Outro

## 🔧 Personalização futura sugerida

- Integrar com banco de dados (Supabase, PlanetScale) para dados compartilhados entre usuários
- Adicionar autenticação (login por usuário)
- Exportar relatório em PDF/Excel
- Envio de alertas por e-mail para manutenções agendadas

---

Desenvolvido com 💙 | Tema: Azul Petróleo
