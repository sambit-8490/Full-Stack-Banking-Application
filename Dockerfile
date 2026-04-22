# --- Stage 1: Build the application with Java 21 ---
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY . .
RUN mvn clean package -DskipTests

# --- Stage 2: Create the final, lightweight image with Java 21 JRE ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy only the built JAR file from the builder stage
COPY --from=build /app/target/BankApplication-0.0.1-SNAPSHOT.jar app.jar

# Expose the port
EXPOSE 8080

# The command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
