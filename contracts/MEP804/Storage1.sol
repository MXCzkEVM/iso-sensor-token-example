// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

contract Storage1 {
    /// @notice Reward that waiting for claim
    mapping(address => uint256) internal _rewardForClaim;

    /// @notice Last memo of a sensor
    mapping(uint256 => string) public lastSensorMemo;
}