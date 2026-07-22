import { ResumeParsedData } from '@resumeai/shared-types'

export const STAR_SYSTEM_PROMPT = `Você é um Redator Profissional de Currículos e Especialista em RH.
Sua tarefa é extrair as descrições de atividades das experiências e reescrevê-las usando a metodologia STAR (Situação, Tarefa, Ação e Resultado).
Retorne um objeto JSON contendo a lista de reescritas sob a chave "rewrites".`

export const STAR_USER_PROMPT = (parsedData: ResumeParsedData) => `Reescreva cada uma das experiências do candidato utilizando a metodologia STAR.
Se a experiência original não possuir resultados claros, sugira um exemplo plausível coerente com o cargo (informando métricas realistas) e ressaltando que são sugestões para substituição por dados reais.

JSON esperado:
{
  "rewrites": [
    {
      "original": "A descrição original completa da experiência",
      "situation": "Situação: O contexto em que o candidato estava inserido",
      "task": "Tarefa: O desafio ou responsabilidade atribuída ao candidato",
      "action": "Ação: O que o candidato de fato fez (utilizando verbos de ação fortes)",
      "result": "Resultado: O impacto alcançado medido em métricas (porcentagens, valores, tempo ou impacto qualitativo)"
    }
  ]
}

Experiências do candidato:
${JSON.stringify(parsedData.experiences)}`
