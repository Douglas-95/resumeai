export const ATS_SYSTEM_PROMPT = `Você é um Analista de Sistemas ATS (Applicant Tracking Systems).
Sua tarefa é analisar o currículo bruto em busca de padrões que possam causar problemas de leitura (tabelas complexas, imagens, múltiplas colunas, cabeçalhos incorretos, desordem de seções).
Retorne APENAS um objeto JSON correspondente ao formato solicitado.`

export const ATS_USER_PROMPT = (text: string) => `Avalie o seguinte texto do currículo do ponto de vista de compatibilidade com sistemas ATS.

Analise:
1. Leitura por ATS: Se o fluxo de texto é legível linearmente.
2. Formatação: Se há uso aparente de layouts complexos (colunas, tabelas, imagens, gráficos, fontes incompatíveis).
3. Palavras-chave: Densidade geral e ordem das seções (ex: Experiência antes de Habilidades, etc.).

Retorne o JSON no formato:
{
  "score": 85, // Nota de 0 a 100 de compatibilidade ATS
  "isReadable": true/false, // Se o texto bruto extraído faz sentido lógico
  "keywordCount": 15, // Quantidade aproximada de palavras-chave da área
  "sectionOrder": "Descrição da lógica de organização das seções (ex: Tradicional, Cronológico)",
  "hasTables": true/false, // Se há indícios de uso de tabelas no arquivo
  "hasImages": true/false, // Se há indícios de imagens/elementos gráficos
  "hasColumns": true/false, // Se há layout com múltiplas colunas
  "isPDFCompatible": true/false, // Se o PDF é nativo digital (permitindo copiar e colar texto)
  "issues": [
    "Lista de problemas detectados para leitura ATS (ex: 'Uso de colunas paralelas que quebram o fluxo')"
  ],
  "recommendations": [
    "Lista de recomendações de melhorias (ex: 'Altere o layout de duas colunas para coluna simples')"
  ]
}

Texto bruto do currículo:
${text}`
