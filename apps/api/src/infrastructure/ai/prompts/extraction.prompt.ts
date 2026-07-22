export const EXTRACTION_SYSTEM_PROMPT = `Você é um Engenheiro de Dados especialista em Recrutamento e Seleção (ATS).
Sua tarefa é extrair e estruturar todos os dados do currículo fornecido.
Retorne APENAS um objeto JSON válido correspondente ao schema solicitado. Não adicione nenhuma introdução, explicação ou bloco de markdown (como \`\`\`json).`

export const EXTRACTION_USER_PROMPT = (text: string) => `Analise o seguinte currículo e extraia todas as informações no formato JSON abaixo.

Schema esperado:
{
  "name": "Nome Completo (ou null)",
  "currentRole": "Cargo atual ou último cargo (ou null)",
  "email": "Email (ou null)",
  "phone": "Telefone (ou null)",
  "location": "Cidade - Estado (ou null)",
  "linkedin": "URL do LinkedIn (ou null)",
  "github": "URL do GitHub (ou null)",
  "portfolio": "URL do portfólio (ou null)",
  "summary": "Resumo profissional completo (ou null)",
  "experiences": [
    {
      "company": "Nome da empresa",
      "role": "Cargo ocupado",
      "startDate": "Data de início (ex: Jan/2020 ou null)",
      "endDate": "Data de término (ex: Presente, Dez/2023 ou null)",
      "isCurrent": true/false,
      "description": "Descrição completa das atividades executadas"
    }
  ],
  "education": [
    {
      "institution": "Nome da instituição",
      "degree": "Grau acadêmico (ex: Bacharelado, Pós-graduação)",
      "field": "Área de estudo (ex: Ciência da Computação ou null)",
      "startDate": "Ano/Mês de início (ou null)",
      "endDate": "Ano/Mês de término (ou null)"
    }
  ],
  "certifications": [
    {
      "name": "Nome da certificação",
      "issuer": "Emissor (ou null)",
      "date": "Data de emissão (ou null)"
    }
  ],
  "hardSkills": ["Lista de habilidades técnicas/ferramentas"],
  "softSkills": ["Lista de competências comportamentais"],
  "languages": [
    {
      "language": "Idioma (ex: Inglês)",
      "level": "Nível de proficiência (ex: Fluente, Avançado ou null)"
    }
  ]
}

Currículo:
${text}`
