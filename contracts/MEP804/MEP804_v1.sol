// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import "./interfaces/IMEP804_v1.sol";
import "./Storage1.sol";

/**
 * @title MEP804 (ISO Sensor Token)
 * @author Ian
 * @notice This contract used to create an apllication for ISO (Initial Sensor Offering).
 */
contract MEP804v1 is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    ERC20Upgradeable,
    IMEP804v1,
    Storage1
{
    // Custom Errors
    error MEP804NothingToClaim();

    /// @notice Contract initialization
    function __MEP804v1_init(uint256 _initialAmount) internal onlyInitializing {
        // mints the initial reward into the contract
        _mint(address(this), _initialAmount);
    }

    /// @notice Return the name of contract, use to identiry the version of the contract
    function name2() external view virtual returns (string memory) {
        return "MEP804v1";
    }

    /// @notice Get amount wait for claim
    function amountForClaim() external view virtual returns (uint256) {
        address _sender = _msgSender();
        return _rewardForClaim[_sender];
    }

    /// @notice Claim reward
    function claimReward() external virtual nonReentrant returns (uint256) {
        address _sender = _msgSender();

        //
        if (_rewardForClaim[_sender] == 0) {
            revert MEP804NothingToClaim();
        }

        // transfers a reward to sender
        uint256 _rewardAmount = _rewardForClaim[_sender];
        _rewardForClaim[_sender] = 0;
        _transfer(address(this), _sender, _rewardAmount);

        //
        emit ClaimRewardDone(_rewardAmount);

        return _rewardAmount;
    }

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
    ) external virtual nonReentrant onlyOwner {
        _rewardForClaim[_rewardTo] = _rewardForClaim[_rewardTo] + _rewardAmount;
        lastSensorMemo[_pidZkevmHash] = _memo;
        emit DataReceived(_memo);
    }

    /// @notice Mint more (onlyOwner)
    /// @param _amount Amont to mint
    function mintMore(uint256 _amount) external virtual onlyOwner {
        _mint(address(this), _amount);
    }

    /// @notice Called when deployed
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _initialAmount
    ) public initializer {
        address _owner = _msgSender();
        console.log("MEP804 initialized. Owner ", _msgSender());
        __ERC20_init(_name, _symbol);
        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        __MEP804v1_init(_initialAmount);
        __Ownable_init_unchained(_owner);
    }

    /// @notice UUPSUpgradeable access control mechanism
    function _authorizeUpgrade(
        address newImplementation
    ) internal virtual override onlyOwner {
        console.log("New implementation address:", newImplementation);
    }
}
