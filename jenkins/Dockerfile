# ── custom-jenkins/Dockerfile ─────────────────────────────────────────────────
# Jenkins avec Node.js 20 + Docker CLI intégrés
FROM jenkins/jenkins:lts-jdk17

USER root

# Installer Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Installer Docker CLI
RUN apt-get install -y docker.io

# Ajouter jenkins au groupe docker
RUN usermod -aG docker jenkins

USER jenkins

# Plugins utiles (installer au démarrage)
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
