const fs = require('fs');

let hhPorts;

function generateMongo(n) {
  let mongoString = "";
  for (let i = 0; i < n; i++) {
    mongoString += `
  mongo-${i + 1}:
    image: mongo
    ports:
      - "27017:27017"
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

    const keyJsonPath = `./parity-authority/parity/authorities/authority${i + 1}.json`
    const keyJson = JSON.parse(fs.readFileSync(keyJsonPath, 'utf8'));
    const address = "0x" + keyJson.address;

    let command = `yarn run-server`;
    command += ` -p 3002`;
    command += ` -a ${address}`;
    command += ` -P node${i + 1}`;
    command += ` -r ${10 * i + 8546}`;
    command += ` -d mongodb://mongo-${i + 1}:27017`;
    command += ` -N http://netting-server:3000`;

    serverString += `
  household-server-${i + 1}:
    build:
      context: .
      dockerfile: household-processing-unit/Dockerfile
    command: ${command}
    ports:
      - "${hhPorts[i]}:3002"
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
    build:
      context: .
      dockerfile: mock-sensor/Dockerfile
    command: yarn run-sensor -h household-server-${i + 1} -p ${hhPorts[i]} -e +
    depends_on:
      - household-server-${i + 1}
    networks:
      - 02-docker_parity_net
`;
  }

  for (let i = numProducers; i < numProducers + numConsumers; i++) {
    sensorString += `
  sensor-server-${i + 1}:
    build:
      context: .
      dockerfile: mock-sensor/Dockerfile
    command: yarn run-sensor -h household-server-${i + 1} -p ${hhPorts[i]} -e -
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

networks:
  02-docker_parity_net:
    external: true

services:

  netting-server:
    build:
      context: .
      dockerfile: netting-entity/Dockerfile
    command: yarn run-netting-entity -p 3000 -i 60000
    ports:
      - "3000:3000"
    networks:
      - 02-docker_parity_net

${mongoDBYml}
${hhServerYml}
${sensorYml}
`;
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
