# Stage 1 — Build Frontend
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY sokoonline-frontend/package*.json ./
RUN npm install
COPY sokoonline-frontend ./
RUN npm run build

# Stage 2 — Build Backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 3 — Run the App
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
COPY --from=frontend-build /frontend/dist ./static
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]