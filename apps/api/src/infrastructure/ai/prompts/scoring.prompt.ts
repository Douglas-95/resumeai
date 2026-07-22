import { ResumeParsedData } from '@resumeai/shared-types'

export const SCORING_SYSTEM_PROMPT = `Você é um Recrutador Sênior e Especialista em Sistemas ATS.
Sua missão é dar notas de 0 a 100 para o currículo do candidato em 10 dimensões distintas, trazendo justificativas que soem de um especialista experiente.
Retorne APENAS um objeto JSON correspondente ao formato solicitado. Sem explicações ou markdown.`

export const SCORING_USER_PROMPT = (resumeText: string, parsedData: ResumeParsedData) => `Avalie o currículo nas 10 dimensões a seguir.
Cada nota deve ser um inteiro de 0 a 100 e conter uma justificativa clara de recrutamento.

Dimensões:
1. overall: Nota geral ponderada do currículo.
2. ats: Compatibilidade de leitura e estrutura com sistemas ATS.
3. recruiter: Qualidade visual, objetividade e atratividade para recrutadores seniores.
4. impact: Mensuração de resultados e conquistas profissionais claras.
5. clarity: Clareza, concordância e concisão do texto.
6. formatting: Estruturação de seções, fontes, colunas e consistência geral.
7. keyword: Densidade e relevância das palavras-chave para a área do candidato.
8. professionalism: Linguagem profissional, ausência de termos informais ou clichês.
9. leadership: Evidências de liderança de projetos, pessoas ou iniciativas próprias.
10. technical: Profundidade e clareza na descrição de hard skills relevantes.

JSON esperado:
{
  "overall": { "value": 80, "justification": "Justificativa..." },
  "ats": { "value": 85, "justification": "Justificativa..." },
  "recruiter": { "value": 75, "justification": "Justificativa..." },
  "impact": { "value": 60, "justification": "Justificativa..." },
  "clarity": { "value": 90, "justification": "Justificativa..." },
  "formatting": { "value": 85, "justification": "Justificativa..." },
  "keyword": { "value": 70, "justification": "Justificativa..." },
  "professionalism": { "value": 95, "justification": "Justificativa..." },
  "leadership": { "value": 50, "justification": "Justificativa..." },
  "technical": { "value": 80, "justification": "Justificativa..." }
}

Texto original do currículo:
${resumeText}

Dados estruturados:
${JSON.stringify(parsedData)}`
