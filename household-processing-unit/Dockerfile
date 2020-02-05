FROM ubuntu:bionic

RUN apt-get update && apt-get install -y gnupg2
RUN apt-get -y install apt-transport-https ca-certificates
RUN apt-get -y install systemd
RUN apt install -y mongodb
RUN apt-get -y install curl
RUN apt -y install nodejs npm
RUN npm install yarn -g
RUN apt -y install git

RUN mkdir /household_processing_unit
WORKDIR /household_processing_unit

COPY scripts/install_parity.sh ./
RUN ./install_parity.sh

COPY contracts ./contracts
COPY helpers ./helpers
COPY household-server ./household-server

COPY package.json truffle-config.js yarn.lock ./

RUN yarn install --network-concurrency 1

COPY household-ui ./household-ui
COPY migrations ./migrations
WORKDIR /household_processing_unit/household-ui
RUN yarn install --network-concurrency 1

WORKDIR /household_processing_unit

COPY parity-authority/parity/config/chain.json ./parity/config/chain.json
COPY parity-authority/parity/config/authority.toml ./parity/authority.toml
COPY household-processing-unit/scripts/start.sh ./
COPY household-server-config.js ./

CMD ./start.sh
