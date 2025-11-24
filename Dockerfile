# Baseado no Node 22 Alpine (Leve e seguro)
FROM node:22-alpine

# Diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (Melhor cache)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta do Next.js
EXPOSE 3000

# Garante que o Next.js aceite conexões externas do Docker
ENV HOSTNAME="0.0.0.0"

# Comando de desenvolvimento
CMD ["npm", "run", "dev"]