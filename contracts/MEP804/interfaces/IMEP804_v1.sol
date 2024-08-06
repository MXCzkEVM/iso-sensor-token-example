// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "../type.sol";

/// @title ISO Contract interfaces
interface IMEP804v1 {
    /// @dev This event gets emitted when claim reward done.
    event ClaimRewardDone(uint256 amount);

    /// @dev This event gets emitted when data is feeded.
    event DataReceived(string memo);

    /// @notice Return the name of contract, use to identiry the version of the contract
    function name2() external view returns (string memory);

    /// @notice Get amount wait for claim
    function amountForClaim() external returns (uint256);

    /// @notice Claim reward
    function claimReward() external returns (uint256);

    /// @notice Feed data (onlyOwner)
    /// @param _pidZkevmHash The PID hash (for zkevm) of the sensor
    /// @param _rewardTo Reward will send to this address
    /// @param _rewardAmount Amount of the reward
    /// @param _memo MEP-3355 memo
    function feedData(
        uint256 _pidZkevmHash,
        address _rewardTo,
        uint256 _rewardAmount,
        string memory _memo
    ) external;

    /// @notice Mint more (onlyOwner)
    /// @param _amount Amount to mint
    function mintMore(uint256 _amount) external;
}
