import { ResumeParsedData } from '@resumeai/shared-types'

export const XYZ_SYSTEM_PROMPT = `Você é um Preparador de Currículos para Big Techs (Google, Meta).
Sua tarefa é transformar frases comuns de responsabilidades no formato Google XYZ: "Conquistei [X], medido por [Y], fazendo [Z]".
Retorne um objeto JSON contendo a lista de reescritas sob a chave "rewrites".`

export const XYZ_USER_PROMPT = (parsedData: ResumeParsedData) => `Analise as experiências e identifique frases que descrevem apenas tarefas ("responsável pelo suporte", "ajudei no desenvolvimento").
Reescreva-as no formato do Google:
"Conquistei [X] medido por [Y] fazendo [Z]"

Se o currículo não contiver métricas reais, sugira métricas plausíveis e indique claramente no campo "note" que o candidato deve adaptá-las para os resultados reais dele.
Priorize sempre métricas (ex: redução de tempo de resposta em 30%, aumento de faturamento em R$ 50k, etc.).

JSON esperado:
{
  "rewrites": [
    {
      "original": "Frase original identificada",
      "rewritten": "Conquistei X medido por Y fazendo Z (reescrita no padrão Google)",
      "hasRealMetrics": true/false, // se havia métricas na frase original ou se foi sugerida
      "note": "Nota explicativa caso a métrica tenha sido sugerida (ou null)"
    }
  ]
}

Experiências do candidato:
${JSON.stringify(parsedData.experiences)}`
