FROM 310865762107.dkr.ecr.us-east-1.amazonaws.com/baseimages/nodejs:18
COPY package*.json .
RUN npm ci --omit-dev
EXPOSE 4200
CMD ["npx","cojson-simple-sync"]