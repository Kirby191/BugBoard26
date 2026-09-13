# ==========================================
# STAGE 1: BUILD (Angular)
# ==========================================
FROM node:24-alpine AS builder
WORKDIR /app

# Copia i file di dipendenza e installa
COPY package*.json ./
RUN npm ci

# Copia il resto del codice e compila l'app per la produzione
COPY . .
RUN npm run build --configuration=production

# ==========================================
# STAGE 2: RUNTIME (Nginx)
# ==========================================
FROM nginx:alpine

# Rimuove la configurazione di default di Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia la configurazione personalizzata creata nello Step 1
COPY nginx.conf /etc/nginx/conf.d/

# Copia l'output della build di Angular nella cartella di Nginx
# NOTA: Assicurati che "front-end" sia il nome corretto nell'output (verifica in angular.json "outputPath")
COPY --from=builder /app/dist/front-end/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]