# Usa uma imagem leve do Node 22 (compatível com seu Next.js 16)
FROM node:22-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência primeiro (para aproveitar cache)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto do projeto
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando para rodar em modo de desenvolvimento
CMD ["npm", "run", "dev"]