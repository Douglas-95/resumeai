import fs from 'fs'
import path from 'path'

const rootEnvPath = path.resolve('.env')

if (fs.existsSync(rootEnvPath)) {
  const envContent = fs.readFileSync(rootEnvPath, 'utf8')

  // Copy to apps/api/.env
  const apiEnvPath = path.resolve('apps/api/.env')
  fs.writeFileSync(apiEnvPath, envContent, 'utf8')
  console.log('✅ Sincronizado .env com apps/api/.env')

  // Copy to apps/web/.env
  // Web app also needs NEXT_PUBLIC_API_URL so we append it if not present
  const webEnvPath = path.resolve('apps/web/.env')
  let webEnvContent = envContent
  if (!webEnvContent.includes('NEXT_PUBLIC_API_URL')) {
    webEnvContent += '\nNEXT_PUBLIC_API_URL="http://localhost:3001"'
  }
  fs.writeFileSync(webEnvPath, webEnvContent, 'utf8')
  console.log('✅ Sincronizado .env com apps/web/.env')
} else {
  console.warn('⚠️ Arquivo .env raiz nao encontrado.')
}
