# ==========================================
# STAGE 1: BUILD
# ==========================================
FROM amazoncorretto:21-alpine AS builder
WORKDIR /app

# Copia il Maven Wrapper e il pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw

# Scarica le dipendenze offline
RUN ./mvnw dependency:go-offline

# Copia il sorgente e compila scartando i test
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ==========================================
# STAGE 2: RUNTIME
# ==========================================
FROM amazoncorretto:21-alpine
WORKDIR /app

# Creazione utente non-root 'appuser'
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copia solo il .jar generato dallo stage precedente
COPY --from=builder /app/target/*.jar app.jar

# Esposta la porta usata dall'auth-service (definita in application.properties)
EXPOSE 8081

# Comando di avvio
ENTRYPOINT ["java", "-jar", "app.jar"]