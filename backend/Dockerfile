FROM maven:3.9.9-eclipse-temurin-21 AS maven-env

FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# Copy Maven from the maven-env stage
COPY --from=maven-env /usr/share/maven /usr/share/maven
RUN ln -s /usr/share/maven/bin/mvn /usr/bin/mvn

# Ensure Maven env variables are set
ENV MAVEN_HOME=/usr/share/maven
ENV MAVEN_CONFIG="/root/.m2"

# Cache dependencies first for faster rebuilds.
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -q -DskipTests clean package

FROM eclipse-temurin:25-jre
WORKDIR /app

# Render sets PORT dynamically; this is a local default.
ENV PORT=8080
EXPOSE 8080

COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar /app/app.jar"]
