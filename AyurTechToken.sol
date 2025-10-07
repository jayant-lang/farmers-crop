// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AyurTechToken is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant REWARD_RATE = 10; // 10 tokens per action
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens
    
    mapping(address => bool) public verifiedFarmers;
    mapping(address => uint256) public farmerRewards;
    mapping(string => bool) public cropCertificates;
    
    event FarmerVerified(address indexed farmer, string certificate);
    event RewardEarned(address indexed farmer, uint256 amount, string action);
    event CropCertificateMinted(string indexed cropId, address indexed farmer);
    
    constructor() ERC20("AyurTech Token", "AYUR") {
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    // Verify a farmer with certificate
    function verifyFarmer(address farmer, string memory certificate) external onlyOwner {
        verifiedFarmers[farmer] = true;
        emit FarmerVerified(farmer, certificate);
    }
    
    // Reward farmer for actions
    function rewardFarmer(address farmer, string memory action) external onlyOwner {
        require(verifiedFarmers[farmer], "Farmer not verified");
        require(totalSupply() + REWARD_RATE <= MAX_SUPPLY, "Max supply reached");
        
        _mint(farmer, REWARD_RATE);
        farmerRewards[farmer] += REWARD_RATE;
        
        emit RewardEarned(farmer, REWARD_RATE, action);
    }
    
    // Mint crop certificate NFT
    function mintCropCertificate(string memory cropId, address farmer) external onlyOwner {
        require(verifiedFarmers[farmer], "Farmer not verified");
        require(!cropCertificates[cropId], "Certificate already exists");
        
        cropCertificates[cropId] = true;
        emit CropCertificateMinted(cropId, farmer);
    }
    
    // Check if farmer is verified
    function isFarmerVerified(address farmer) external view returns (bool) {
        return verifiedFarmers[farmer];
    }
    
    // Get farmer's total rewards
    function getFarmerRewards(address farmer) external view returns (uint256) {
        return farmerRewards[farmer];
    }
    
    // Check if crop certificate exists
    function hasCropCertificate(string memory cropId) external view returns (bool) {
        return cropCertificates[cropId];
    }
}





