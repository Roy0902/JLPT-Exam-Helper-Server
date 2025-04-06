FROM node:22
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev build-essential python3-venv
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY python_requirements.txt ./
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --no-cache-dir -r python_requirements.txt
COPY . .
CMD ["node", "app.js"]