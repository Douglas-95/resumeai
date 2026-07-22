import { ResumeParsedData } from '@resumeai/shared-types'

export const INSIGHTS_SYSTEM_PROMPT = `Você é um Consultor de Carreira Sênior e Especialista em RH.
Analise os dados estruturados do currículo e identifique pontos fortes, pontos fracos e oportunidades de melhoria.
Retorne um objeto JSON contendo uma lista de insights sob a chave "insights".`

export const INSIGHTS_USER_PROMPT = (resumeText: string, parsedData: ResumeParsedData) => `Identifique automaticamente do currículo os seguintes tipos de insights:
- STRENGTH (Pontos fortes)
- WEAKNESS (Pontos fracos)
- MISSING_INFO (Informações importantes ausentes)
- REDUNDANT_INFO (Informações redundantes)
- LONG_PARAGRAPH (Parágrafos muito longos)
- POOR_EXPERIENCE_DESC (Experiências mal descritas)
- EXCESSIVE_TEXT (Excesso de texto)
- LACK_OBJECTIVITY (Pouca objetividade)
- FEW_ACTION_VERBS (Pouco uso de verbos de ação)
- FEW_METRICS (Pouca mensuração de resultados/métricas)
- ATS_UNFRIENDLY (Currículo pouco atrativo para ATS)
- GENERIC_WORDS (Uso de palavras genéricas e clichês)
- OUTDATED_INFO (Informações aparentemente desatualizadas)

Retorne pelo menos 5 insights relevantes encontrados no currículo. Cada insight deve conter a estrutura exata:
{
  "insights": [
    {
      "type": "STRENGTH | WEAKNESS | MISSING_INFO | REDUNDANT_INFO | LONG_PARAGRAPH | POOR_EXPERIENCE_DESC | EXCESSIVE_TEXT | LACK_OBJECTIVITY | FEW_ACTION_VERBS | FEW_METRICS | ATS_UNFRIENDLY | GENERIC_WORDS | OUTDATED_INFO",
      "problem": "Título curto do problema identificado",
      "explanation": "Explicação detalhada da falha/problema encontrada",
      "impact": "Qual o impacto negativo disso na triagem de currículo",
      "howToFix": "Passo a passo prático de como corrigir esse ponto",
      "improvementExample": "Exemplo real de como reescrever ou melhorar (ou null)"
    }
  ]
}

Dados do currículo:
${JSON.stringify(parsedData)}`
