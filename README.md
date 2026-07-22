# ResumeAI

Plataforma SaaS inteligente para avaliação de currículos com IA.

## Estrutura do Monorepo

```
resumeai/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # Fastify backend
├── packages/
│   ├── shared-types/ # Types e schemas Zod compartilhados
│   └── config/       # Configs ESLint, TypeScript, Tailwind
├── turbo.json
└── package.json
```

## Pré-requisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL 16
- Redis

## Setup

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Subir em desenvolvimento
npm run dev
```

## Variáveis de Ambiente

Todas as chaves de API de LLM são configuradas exclusivamente via variáveis de ambiente.
Veja `apps/api/.env.example` para a lista completa.

## Tecnologias

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Fastify, TypeScript, Prisma, PostgreSQL
- **IA**: Claude 3.5 Sonnet / GPT-4o (configurável via `AI_PROVIDER`)
- **Infra**: Supabase Auth + Storage, Redis + BullMQ, Vercel
