// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CropManagement is Ownable, ReentrancyGuard {
    struct Crop {
        string name;
        string hindi;
        string scientificName;
        string category;
        uint256 plantingDate;
        uint256 expectedHarvest;
        string location;
        address farmer;
        bool isHarvested;
        string diseaseHistory;
        uint256 yield;
    }
    
    struct DiseaseRecord {
        string diseaseName;
        string symptoms;
        string treatment;
        uint256 timestamp;
        bool isResolved;
    }
    
    mapping(uint256 => Crop) public crops;
    mapping(uint256 => DiseaseRecord[]) public cropDiseases;
    mapping(address => uint256[]) public farmerCrops;
    mapping(string => bool) public diseaseDatabase;
    
    uint256 public cropCounter;
    
    event CropRegistered(uint256 indexed cropId, address indexed farmer, string name);
    event DiseaseDetected(uint256 indexed cropId, string diseaseName, string symptoms);
    event DiseaseTreated(uint256 indexed cropId, string diseaseName, string treatment);
    event CropHarvested(uint256 indexed cropId, uint256 yield);
    
    // Register a new crop
    function registerCrop(
        string memory name,
        string memory hindi,
        string memory scientificName,
        string memory category,
        uint256 expectedHarvest,
        string memory location
    ) external returns (uint256) {
        uint256 cropId = cropCounter++;
        
        crops[cropId] = Crop({
            name: name,
            hindi: hindi,
            scientificName: scientificName,
            category: category,
            plantingDate: block.timestamp,
            expectedHarvest: expectedHarvest,
            location: location,
            farmer: msg.sender,
            isHarvested: false,
            diseaseHistory: "",
            yield: 0
        });
        
        farmerCrops[msg.sender].push(cropId);
        
        emit CropRegistered(cropId, msg.sender, name);
        return cropId;
    }
    
    // Record disease detection
    function recordDisease(
        uint256 cropId,
        string memory diseaseName,
        string memory symptoms,
        string memory treatment
    ) external {
        require(crops[cropId].farmer == msg.sender, "Not crop owner");
        require(!crops[cropId].isHarvested, "Crop already harvested");
        
        DiseaseRecord memory newDisease = DiseaseRecord({
            diseaseName: diseaseName,
            symptoms: symptoms,
            treatment: treatment,
            timestamp: block.timestamp,
            isResolved: false
        });
        
        cropDiseases[cropId].push(newDisease);
        diseaseDatabase[diseaseName] = true;
        
        emit DiseaseDetected(cropId, diseaseName, symptoms);
    }
    
    // Mark disease as treated
    function treatDisease(uint256 cropId, uint256 diseaseIndex) external {
        require(crops[cropId].farmer == msg.sender, "Not crop owner");
        require(diseaseIndex < cropDiseases[cropId].length, "Invalid disease index");
        
        cropDiseases[cropId][diseaseIndex].isResolved = true;
        
        emit DiseaseTreated(cropId, cropDiseases[cropId][diseaseIndex].diseaseName, 
                          cropDiseases[cropId][diseaseIndex].treatment);
    }
    
    // Record harvest
    function recordHarvest(uint256 cropId, uint256 yield) external {
        require(crops[cropId].farmer == msg.sender, "Not crop owner");
        require(!crops[cropId].isHarvested, "Already harvested");
        
        crops[cropId].isHarvested = true;
        crops[cropId].yield = yield;
        
        emit CropHarvested(cropId, yield);
    }
    
    // Get crop details
    function getCrop(uint256 cropId) external view returns (Crop memory) {
        return crops[cropId];
    }
    
    // Get farmer's crops
    function getFarmerCrops(address farmer) external view returns (uint256[] memory) {
        return farmerCrops[farmer];
    }
    
    // Get crop diseases
    function getCropDiseases(uint256 cropId) external view returns (DiseaseRecord[] memory) {
        return cropDiseases[cropId];
    }
    
    // Check if disease exists in database
    function isDiseaseKnown(string memory diseaseName) external view returns (bool) {
        return diseaseDatabase[diseaseName];
    }
}





