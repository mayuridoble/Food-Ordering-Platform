FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy only project files (inside Online-Food-Ordering)
COPY . .

# Give permission to mvnw
RUN chmod +x mvnw

# Build the project
RUN ./mvnw clean package -DskipTests

# Run the jar
CMD ["java", "-jar", "target/*.jar"]
