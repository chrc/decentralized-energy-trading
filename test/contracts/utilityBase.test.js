/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const UtilityBase = artifacts.require("UtilityBase");
const {
  BN,
  constants,
  expectEvent,
  shouldFail
} = require("openzeppelin-test-helpers");
const expect = require("chai").use(require("chai-bn")(BN)).expect;

contract("UtilityBase", ([owner, household, other]) => {
  beforeEach(async () => {
    this.instance = await UtilityBase.new({
      from: owner
    });
  });

  describe("Households", () => {
    context("with a new household", async () => {
      beforeEach(async () => {
        ({ logs: this.logs } = await this.instance.addHousehold(household, {
          from: owner
        }));
      });

      it("should create a new household", async () => {
        const hh = await this.instance.getHousehold(household, {
          from: household
        });

        expect(hh[0]).to.be.true; // initialized
        expect(hh[1]).to.be.bignumber.that.is.zero; // renewableEnergy
        expect(hh[2]).to.be.bignumber.that.is.zero; // nonRenewableEnergy
        expect(hh[3]).to.be.bignumber.that.is.zero; // producedRenewableEnergy
        expect(hh[4]).to.be.bignumber.that.is.zero; // consumedRenewableEnergy
        expect(hh[5]).to.be.bignumber.that.is.zero; // producedNonRenewableEnergy
        expect(hh[6]).to.be.bignumber.that.is.zero; // consumedNonRenewableEnergy
      });

      it("emits event NewHousehold", async () => {
        expectEvent.inLogs(this.logs, "NewHousehold", {
          household: household
        });
      });

      it("reverts when attempting to add an existing household", async () => {
        await shouldFail.reverting(
          this.instance.addHousehold(household, {
            from: owner
          })
        );
      });
    });
  });

  describe("Record household energy production and consumption", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(household, {
        from: owner
      }); // Add dummy household
    });

    context("Energy", async () => {
      it("should record the net amount of energy produced correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        const netEnergy = await this.instance.balanceOf(household);
        expect(netEnergy).to.be.bignumber.equal("10");
      });

      it("should record amount of consumed energy correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        const consumedEnergy = await this.instance.balanceOfConsumedEnergy(
          household
        );
        expect(consumedEnergy).to.be.bignumber.equal("10");
      });

      it("should record amount of produced energy correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        const producedEnergy = await this.instance.balanceOfProducedEnergy(
          household
        );
        expect(producedEnergy).to.be.bignumber.equal("20");
      });
    });

    context("Renewable energy", async () => {
      it("should record the net amount of energy produced correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        const netRenewableEnergy = await this.instance.balanceOfRenewableEnergy(
          household
        );
        expect(netRenewableEnergy).to.be.bignumber.equal("5");
      });

      it("should record amount of consumed energy correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        const consumedRenewableEnergy = await this.instance.balanceOfConsumedRenewableEnergy(
          household
        );
        expect(consumedRenewableEnergy).to.be.bignumber.equal("5");
      });

      it("should record amount of produced energy correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        const producedRenewableEnergy = await this.instance.balanceOfProducedRenewableEnergy(
          household
        );
        expect(producedRenewableEnergy).to.be.bignumber.equal("10");
      });

      it("emits event RenewableEnergyChanged", async () => {
        ({ logs: this.logs } = await this.instance.updateRenewableEnergy(
          household,
          10,
          5,
          {
            from: household
          }
        ));

        expectEvent.inLogs(this.logs, "RenewableEnergyChanged", {
          household: household,
          energy: new BN(5)
        });
      });
    });

    context("Non-renewable energy", async () => {
      it("should record the net amount of energy produced correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        const netNonRenewableEnergy = await this.instance.balanceOfNonRenewableEnergy(
          household
        );
        expect(netNonRenewableEnergy).to.be.bignumber.equal("5");
      });

      it("should record amount of consumed energy correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        const consumedNonRenewableEnergy = await this.instance.balanceOfConsumedNonRenewableEnergy(
          household
        );
        expect(consumedNonRenewableEnergy).to.be.bignumber.equal("5");
      });

      it("should record amount of produced energy correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        const producedNonRenewableEnergy = await this.instance.balanceOfProducedNonRenewableEnergy(
          household
        );
        expect(producedNonRenewableEnergy).to.be.bignumber.equal("10");
      });

      it("emits event NonRenewableEnergyChanged", async () => {
        ({ logs: this.logs } = await this.instance.updateNonRenewableEnergy(
          household,
          10,
          5,
          {
            from: household
          }
        ));

        expectEvent.inLogs(this.logs, "NonRenewableEnergyChanged", {
          household: household,
          energy: new BN(5)
        });
      });
    });

    it("should revert, onlyHousehold required", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(household, 0, 0, {
          from: other
        })
      );
    });

    it("should revert, householdExists required", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(other, 0, 0, {
          from: other
        })
      );
    });

    it("should revert on negative _producedEnergy value", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(household, -10, 10)
      );
    });

    it("should revert on negative _consumedEnergy value", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(household, 10, -10)
      );
    });
  });

  describe("Record total energy production and consumption", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(household, {
        from: owner
      }); // Add dummy household
    });

    context("Total energy", async () => {
      it("should record the net amount of total energy produced correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        const totalEnergy = await this.instance.totalEnergy();
        expect(totalEnergy).to.be.bignumber.equal("10");
      });

      it("should record the total amount of consumed energy correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        const totalEnergy = await this.instance.totalConsumedEnergy();
        expect(totalEnergy).to.be.bignumber.equal("10");
      });

      it("should record the total amount of produced energy correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        const totalEnergy = await this.instance.totalProducedEnergy();
        expect(totalEnergy).to.be.bignumber.equal("20");
      });
    });

    context("Total renewable energy", async () => {
      it("should record the net amount of total energy produced correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        const totalRenewableEnergy = await this.instance.totalRenewableEnergy();
        expect(totalRenewableEnergy).to.be.bignumber.equal("5");
      });

      it("should record the total amount of consumed energy correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        const totalRenewableEnergy = await this.instance.totalConsumedRenewableEnergy();
        expect(totalRenewableEnergy).to.be.bignumber.equal("5");
      });

      it("should record the total amount of produced energy correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        const totalRenewableEnergy = await this.instance.totalProducedRenewableEnergy();
        expect(totalRenewableEnergy).to.be.bignumber.equal("10");
      });
    });

    context("Total non-renewable energy", async () => {
      it("should record the net amount of total energy produced correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        const totalNonRenewableEnergy = await this.instance.totalNonRenewableEnergy();
        expect(totalNonRenewableEnergy).to.be.bignumber.equal("5");
      });

      it("should record the total amount of consumed energy correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        const totalRenewableEnergy = await this.instance.totalConsumedNonRenewableEnergy();
        expect(totalRenewableEnergy).to.be.bignumber.equal("5");
      });

      it("should record the total amount of produced energy correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        const totalRenewableEnergy = await this.instance.totalProducedNonRenewableEnergy();
        expect(totalRenewableEnergy).to.be.bignumber.equal("10");
      });
    });
  });
});
