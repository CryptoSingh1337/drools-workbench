FROM 3.9.9-eclipse-temurin-24-alpine AS builder

COPY ./src/main src/main
COPY ./pom.xml pom.xml

RUN mvn clean package -DskipTests

FROM eclipse-temurin:24-jre-alpine
COPY --from=builder target/*.jar app.jar
EXPOSE $PORT
CMD ["java", "-jar", "app.jar"]
