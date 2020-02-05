const fs = require('fs');

let dbPorts;
let hhPorts;

function generateMongo(n) {
  dbPorts = new Array(n);
  const portStart = 27017;
  let mongoString = "";
  for (let i = 0; i < n; i++) {
    dbPorts[i] = portStart + i;
    mongoString += `
  mongo-${i + 1}:
    image: mongo
    ports:
      - "${dbPorts[i]}:27017"
    networks:
      - 02-docker_parity_net
`;
  }
  return mongoString;
}

function generateServer(n) {
  hhPorts = new Array(n);
  const portStart = 3002;
  let serverString = "";
  for (let i = 0; i < n; i++) {
    hhPorts[i] = portStart + i;

    const keyJson = JSON.parse(fs.readFileSync(`./parity-authority/parity/authorities/authority${i + 1}.json`, 'utf8'));
    const address = "0x" + keyJson.address;

    let command = `yarn run-server`;
    command += ` -p 3002`;
    command += ` -a ${address}`;
    command += ` -P node${i + 1}`;
    command += ` -n authority_${i + 1}`;
    command += ` -d mongodb://mongo-${i + 1}:27017`;
    command += ` -N http://netting-server:3000`;

    serverString += `
  household-server-${i + 1}:
    build: './household-server'
    command: ${command}
    volumes:
      - /usr/src/app
      - /usr/src/app/node_modules
    ports:
      - "${hhPorts[i]}:3002"
    restart: unless-stopped
    depends_on:
      - mongo-${i + 1}
      - netting-server
    networks:
      - 02-docker_parity_net
`;
  }
  return serverString;
}

function generateSensor(numProducers, numConsumers) {
  let sensorString = "";
  for (let i = 0; i < numProducers; i++) {
    sensorString += `
  sensor-server-${i + 1}:
    build: './mock-sensor'
    command: yarn run-sensor -h household-server-${i + 1} -p ${hhPorts[i]} -e +
    volumes:
      - /usr/src/app
      - /usr/src/app/node_modules
    restart: unless-stopped
    depends_on:
      - household-server-${i + 1}
    networks:
      - 02-docker_parity_net
`;
  }

  for (let i = numProducers; i < numProducers + numConsumers; i++) {
    sensorString += `
  sensor-server-${i + 1}:
    build: './mock-sensor'
    command: yarn run-sensor -h household-server-${i + 1} -p ${hhPorts[i]} -e -
    volumes:
      - /usr/src/app
      - /usr/src/app/node_modules
    restart: unless-stopped
    depends_on:
      - household-server-${i + 1}
    networks:
      - 02-docker_parity_net
`;
  }
  return sensorString;
}

function generateYML(numProducers, numConsumers) {
  const mongoDBYml = generateMongo(numProducers + numConsumers);
  const hhServerYml = generateServer(numProducers + numConsumers);
  const sensorYml = generateSensor(numProducers, numConsumers);

  return `
version: '3.5'
services:

  netting-server:
    build: './netting-entity/dockerized_setup'
    command: yarn run-netting-entity -p 3000 -i 60000
    volumes:
      - /usr/src/app
      - /usr/src/app/node_modules
    ports:
      - "3000:3000"
    restart: unless-stopped
    networks:
      - 02-docker_parity_net

${mongoDBYml}
${hhServerYml}
${sensorYml}

networks:
  02-docker_parity_net:
    external: true`;
}

let args = process.argv.slice(2);
if (args.length === 2 && args[0] >= 1 && args[1] >= 1) {
  const numProducers = Number(args[0]);
  const numConsumers = Number(args[1]);

  const nettingYml = generateYML(numProducers, numConsumers);

  fs.writeFile("netting_test.yml", nettingYml, "utf8", err => {
    if (err) throw err;
  });
} else {
  console.log(
    "ERROR! The number of inputs provided is less than two OR inputs are not numbers OR not numbers >= 1!" +
    +"\nThe Setup-Script stopped!" +
    +"\nPlease provide for the numbers of HHs two integer values >= 1!"
  );
}
