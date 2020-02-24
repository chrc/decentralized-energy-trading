const contractHelper = require("../../helpers/contract");

module.exports = {
  /**
   * retrieves meterDeltaHash after netting for specific household
   * @param {String} network Web3 instance.
   * @param {String} address web3 contract instance.
   * @param {string} password Current meter change in kWh.
   */
  getAfterNettingHash: async (web3, address, password, billingPeriod) => {
    const utilityContract = new web3.eth.Contract(
      contractHelper.getAbi("dUtility"),
      contractHelper.getDeployedAddress("dUtility", await web3.eth.net.getId())
    );

    await web3.eth.personal.unlockAccount(address, password, null);

    // TODO use msg.sender in smart contract instead of passing address as argument
    return await utilityContract.methods
      .getHouseholdAfterNettingHash(billingPeriod, address)
      .call({ from: address, gas: 60000000 });
  }
};
