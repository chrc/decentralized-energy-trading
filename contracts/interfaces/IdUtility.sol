
pragma solidity >=0.5.0 <0.6.0;

/**
 * @title dUtility interface
 */
contract IdUtility {

  /* Events */
  event NewHousehold(address indexed household);

  event NettingSuccess();

  event CheckHashesSuccess();

  event RenewableEnergyChanged(address indexed household, bytes32 newDeltaEnergy);

  event NonRenewableEnergyChanged(address indexed household, bytes32 newDeltaEnergy);

  /* Household management */
  function addHousehold(address _household) external returns (bool);

  function getHousehold(address _household) external view returns (bool, bytes32, bytes32);

  function removeHousehold(address _household) external returns (bool);
  function _concatNextHash(uint256[4] memory hashes) private returns (bytes32);

  /* Settlement verification related methods */
  function setVerifier(address _verifier) external returns (bool);

  function _verifyNetting(
    uint256[2] memory _a,
    uint256[2][2] memory _b,
    uint256[2] memory _c,
    uint256[4] memory _input) private returns (bool success);

  function _checkHashes(
    address[] memory _households,
    uint256[4] memory _inputs
    ) private returns (bool);

  function checkNetting(
    address[] calldata _households,
    uint256[2] calldata _a,
    uint256[2][2] calldata _b,
    uint256[2] calldata _c,
    uint256[4] calldata _input) external returns (bool);

  function getDeedsLength() external view returns (uint256);

  /* dUtility household balance change tracking methods */
  function updateRenewableEnergy(address _household, bytes32 deltaEnergy) external returns (bool);

  function updateNonRenewableEnergy(address _household, bytes32 deltaEnergy) external returns (bool);
}