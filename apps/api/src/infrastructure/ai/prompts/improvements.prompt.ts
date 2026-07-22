import { ResumeParsedData } from '@resumeai/shared-types'

export const IMPROVEMENTS_SYSTEM_PROMPT = `Você é um Consultor de Imagem Profissional e Posicionamento de Carreira.
Sua tarefa é sugerir melhorias automáticas de perfil e criar diferentes versões estruturadas do currículo do candidato.
Retorne um objeto JSON válido com as melhorias sugeridas.`

export const IMPROVEMENTS_USER_PROMPT = (parsedData: ResumeParsedData) => `Com base nos dados fornecidos do candidato, gere as seguintes sugestões e resumos personalizados:

Gere:
1. professionalTitle: Um título profissional moderno e otimizado para o mercado (ex: 'Engenheiro de Software Sênior | Tech Lead').
2. professionalSummary: Um resumo profissional curto e impactante (cerca de 3-4 frases).
3. linkedinHeadline: Uma headline atrativa para o topo do LinkedIn.
4. gupySummary: Resumo otimizado especificamente para a plataforma Gupy (foco em palavras-chave duras).
5. indeedSummary: Resumo otimizado para a plataforma Indeed.
6. cathoSummary: Resumo otimizado para a plataforma Catho.
7. internationalSummary: Resumo otimizado em inglês para vagas internacionais.
8. atsFriendlyVersion: Uma versão resumida e estruturada de forma simples focando apenas em leitura de robôs ATS.
9. modernVersion: Uma sugestão de layout e estrutura moderna focando em impacto visual e clareza.
10. executiveVersion: Uma versão refinada e elegante voltada para cargos seniores ou de liderança.
11. internationalVersion: Versão do currículo traduzida e adaptada para inglês (padrão Resume/CV americano).

Retorne no formato JSON:
{
  "professionalTitle": "...",
  "professionalSummary": "...",
  "linkedinHeadline": "...",
  "gupySummary": "...",
  "indeedSummary": "...",
  "cathoSummary": "...",
  "internationalSummary": "...",
  "atsFriendlyVersion": "...",
  "modernVersion": "...",
  "executiveVersion": "...",
  "internationalVersion": "..."
}

Dados do candidato:
${JSON.stringify(parsedData)}`
