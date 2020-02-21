const web3Utils = require("web3-utils");
const { measureEvent } = require("../helpers/measurements");
const { getBillingPeriod } = require("../helpers/billing-cycles");
const web3Helper = require("../helpers/web3");
const zokratesHelper = require("../helpers/zokrates");

const ned = require("./apis/ned");

module.exports = {
  /**
   * Collects transfers from NED sever and writes them into DB.
   * @param {{
   *   host: string,
   *   port: number,
   *   dbUrl: string,
   *   nedUrl: string,
   *   network: string,
   *   address: string,
   *   password: string,
   *   dbName: string,
   *   sensorInterval: number,
   *   sensorDataCollection: string,
   *   utilityDataCollection: string
   * }} config Server configuration.
   * @param {Object} web3 Web3 instance.
   * @param {Object} utilityContract web3 contract instance.
   * @param {number} meterDelta Current meter change in kWh.
   */
  putMeterReading: async (config, web3, utilityContract, meterDelta) => {
    const { address, password, sensorInterval } = config;
    const timestamp = Date.now();
    const billingPeriod = getBillingPeriod(sensorInterval, timestamp);
    const hhid = "household_" + config.address;
    const measureEvt = name =>
      measureEvent(hhid, name, billingPeriod, config.address);

    measureEvt("meter_reading_process_begin");

    const hash = zokratesHelper.packAndHash(meterDelta);

    measureEvt("meter_to_contract_begin");
    await web3.eth.personal.unlockAccount(address, password, null);
    await utilityContract.methods
      .updateRenewableEnergy(billingPeriod, address, web3Utils.hexToBytes(hash))
      .send({ from: address }, (error, txHash) => {
        if (error) {
          console.error(error);
          throw error;
        }
        console.log("dUtility.updateRenewableEnergy txHash", txHash);
      });
    measureEvt("meter_to_contract_end");

    const { signature } = await web3Helper.signData(
      web3,
      address,
      password,
      hash
    );

    measureEvt("meter_to_net_begin");
    ned.putSignedMeterReading(config.nedUrl, address, {
      signature,
      hash,
      timestamp,
      billingPeriod,
      meterDelta,
    });
    measureEvt("meter_to_net_end");

    measureEvt("meter_reading_process_end");
  }
};
