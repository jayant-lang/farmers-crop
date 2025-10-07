class Web3Service {
  constructor() {
    this.web3 = null;
    this.contracts = {};
    this.userAddress = null;
    this.isConnected = false;
  }

  // Initialize Web3 connection
  async init() {
    if (typeof window.ethereum !== 'undefined') {
      this.web3 = new Web3(window.ethereum);
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await this.web3.eth.getAccounts();
        this.userAddress = accounts[0];
        this.isConnected = true;
        
        console.log('🌐 Web3 connected:', this.userAddress);
        return true;
      } catch (error) {
        console.error('❌ Web3 connection failed:', error);
        return false;
      }
    } else {
      console.error('❌ MetaMask not installed');
      return false;
    }
  }

  // Load smart contracts
  async loadContracts() {
    if (!this.web3) return false;

    try {
      // Contract addresses (these would be from deployment)
      const contractAddresses = {
        ayurToken: '0x...', // Replace with actual deployed address
        cropManagement: '0x...', // Replace with actual deployed address
        cropMarketplace: '0x...' // Replace with actual deployed address
      };

      // Load AyurTech Token contract
      const ayurTokenABI = [
        // ERC20 standard functions
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        // Custom functions
        "function isFarmerVerified(address farmer) view returns (bool)",
        "function getFarmerRewards(address farmer) view returns (uint256)",
        "function rewardFarmer(address farmer, string memory action)",
        "function mintCropCertificate(string memory cropId, address farmer)",
        // Events
        "event RewardEarned(address indexed farmer, uint256 amount, string action)",
        "event CropCertificateMinted(string indexed cropId, address indexed farmer)"
      ];

      this.contracts.ayurToken = new this.web3.eth.Contract(ayurTokenABI, contractAddresses.ayurToken);

      // Load Crop Management contract
      const cropManagementABI = [
        "function registerCrop(string memory name, string memory hindi, string memory scientificName, string memory category, uint256 expectedHarvest, string memory location) returns (uint256)",
        "function recordDisease(uint256 cropId, string memory diseaseName, string memory symptoms, string memory treatment)",
        "function treatDisease(uint256 cropId, uint256 diseaseIndex)",
        "function recordHarvest(uint256 cropId, uint256 yield)",
        "function getCrop(uint256 cropId) view returns (tuple(string name, string hindi, string scientificName, string category, uint256 plantingDate, uint256 expectedHarvest, string location, address farmer, bool isHarvested, string diseaseHistory, uint256 yield))",
        "function getFarmerCrops(address farmer) view returns (uint256[])",
        "function getCropDiseases(uint256 cropId) view returns (tuple(string diseaseName, string symptoms, string treatment, uint256 timestamp, bool isResolved)[])",
        // Events
        "event CropRegistered(uint256 indexed cropId, address indexed farmer, string name)",
        "event DiseaseDetected(uint256 indexed cropId, string diseaseName, string symptoms)",
        "event CropHarvested(uint256 indexed cropId, uint256 yield)"
      ];

      this.contracts.cropManagement = new this.web3.eth.Contract(cropManagementABI, contractAddresses.cropManagement);

      // Load Crop Marketplace contract
      const cropMarketplaceABI = [
        "function listCrop(uint256 cropId, uint256 price, uint256 quantity, string memory description) returns (uint256)",
        "function placeOrder(uint256 listingId, uint256 quantity)",
        "function completeOrder(uint256 orderId)",
        "function cancelListing(uint256 listingId)",
        "function getListing(uint256 listingId) view returns (tuple(uint256 cropId, address seller, uint256 price, uint256 quantity, bool isActive, uint256 listingDate, string description))",
        "function getOrder(uint256 orderId) view returns (tuple(uint256 listingId, address buyer, uint256 quantity, uint256 totalPrice, bool isCompleted, uint256 orderDate))",
        "function getActiveListings() view returns (uint256[])",
        // Events
        "event CropListed(uint256 indexed listingId, address indexed seller, uint256 cropId, uint256 price)",
        "event OrderPlaced(uint256 indexed orderId, address indexed buyer, uint256 listingId, uint256 quantity)"
      ];

      this.contracts.cropMarketplace = new this.web3.eth.Contract(cropMarketplaceABI, contractAddresses.cropMarketplace);

      console.log('📋 Smart contracts loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load contracts:', error);
      return false;
    }
  }

  // Get user's token balance
  async getTokenBalance() {
    if (!this.contracts.ayurToken || !this.userAddress) return 0;
    try {
      const balance = await this.contracts.ayurToken.methods.balanceOf(this.userAddress).call();
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('❌ Failed to get token balance:', error);
      return 0;
    }
  }

  // Check if user is verified farmer
  async isFarmerVerified() {
    if (!this.contracts.ayurToken || !this.userAddress) return false;
    try {
      return await this.contracts.ayurToken.methods.isFarmerVerified(this.userAddress).call();
    } catch (error) {
      console.error('❌ Failed to check farmer verification:', error);
      return false;
    }
  }

  // Get farmer rewards
  async getFarmerRewards() {
    if (!this.contracts.ayurToken || !this.userAddress) return 0;
    try {
      const rewards = await this.contracts.ayurToken.methods.getFarmerRewards(this.userAddress).call();
      return this.web3.utils.fromWei(rewards, 'ether');
    } catch (error) {
      console.error('❌ Failed to get farmer rewards:', error);
      return 0;
    }
  }

  // Register a crop on blockchain
  async registerCrop(cropData) {
    if (!this.contracts.cropManagement) return null;
    try {
      const result = await this.contracts.cropManagement.methods.registerCrop(
        cropData.name,
        cropData.hindi,
        cropData.scientificName,
        cropData.category,
        cropData.expectedHarvest,
        cropData.location
      ).send({ from: this.userAddress });
      
      return result.events.CropRegistered.returnValues.cropId;
    } catch (error) {
      console.error('❌ Failed to register crop:', error);
      return null;
    }
  }

  // Record disease on blockchain
  async recordDisease(cropId, diseaseData) {
    if (!this.contracts.cropManagement) return false;
    try {
      await this.contracts.cropManagement.methods.recordDisease(
        cropId,
        diseaseData.name,
        diseaseData.symptoms,
        diseaseData.treatment
      ).send({ from: this.userAddress });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to record disease:', error);
      return false;
    }
  }

  // Record harvest on blockchain
  async recordHarvest(cropId, yield) {
    if (!this.contracts.cropManagement) return false;
    try {
      await this.contracts.cropManagement.methods.recordHarvest(cropId, yield).send({ from: this.userAddress });
      return true;
    } catch (error) {
      console.error('❌ Failed to record harvest:', error);
      return false;
    }
  }

  // Get farmer's crops from blockchain
  async getFarmerCrops() {
    if (!this.contracts.cropManagement || !this.userAddress) return [];
    try {
      const cropIds = await this.contracts.cropManagement.methods.getFarmerCrops(this.userAddress).call();
      const crops = [];
      
      for (const cropId of cropIds) {
        const crop = await this.contracts.cropManagement.methods.getCrop(cropId).call();
        crops.push({ id: cropId, ...crop });
      }
      
      return crops;
    } catch (error) {
      console.error('❌ Failed to get farmer crops:', error);
      return [];
    }
  }

  // List crop for sale
  async listCrop(cropId, price, quantity, description) {
    if (!this.contracts.cropMarketplace) return null;
    try {
      const result = await this.contracts.cropMarketplace.methods.listCrop(
        cropId,
        this.web3.utils.toWei(price.toString(), 'ether'),
        quantity,
        description
      ).send({ from: this.userAddress });
      
      return result.events.CropListed.returnValues.listingId;
    } catch (error) {
      console.error('❌ Failed to list crop:', error);
      return null;
    }
  }

  // Get active listings
  async getActiveListings() {
    if (!this.contracts.cropMarketplace) return [];
    try {
      const listingIds = await this.contracts.cropMarketplace.methods.getActiveListings().call();
      const listings = [];
      
      for (const listingId of listingIds) {
        const listing = await this.contracts.cropMarketplace.methods.getListing(listingId).call();
        listings.push({ id: listingId, ...listing });
      }
      
      return listings;
    } catch (error) {
      console.error('❌ Failed to get active listings:', error);
      return [];
    }
  }

  // Place an order
  async placeOrder(listingId, quantity) {
    if (!this.contracts.cropMarketplace) return null;
    try {
      const result = await this.contracts.cropMarketplace.methods.placeOrder(listingId, quantity).send({ from: this.userAddress });
      return result.events.OrderPlaced.returnValues.orderId;
    } catch (error) {
      console.error('❌ Failed to place order:', error);
      return null;
    }
  }

  // Listen to contract events
  setupEventListeners() {
    if (!this.contracts.ayurToken) return;

    // Listen for reward events
    this.contracts.ayurToken.events.RewardEarned()
      .on('data', (event) => {
        console.log('🎉 Reward earned:', event.returnValues);
        this.showNotification(`You earned ${event.returnValues.amount} AYUR tokens for ${event.returnValues.action}!`);
      });

    // Listen for crop registration events
    this.contracts.cropManagement.events.CropRegistered()
      .on('data', (event) => {
        console.log('🌾 Crop registered:', event.returnValues);
        this.showNotification(`Crop ${event.returnValues.name} registered successfully!`);
      });
  }

  // Show notification
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #00baf2;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-weight: 600;
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  // Get network info
  async getNetworkInfo() {
    if (!this.web3) return null;
    try {
      const networkId = await this.web3.eth.net.getId();
      const networkName = this.getNetworkName(networkId);
      return { id: networkId, name: networkName };
    } catch (error) {
      console.error('❌ Failed to get network info:', error);
      return null;
    }
  }

  // Get network name from ID
  getNetworkName(networkId) {
    const networks = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten Testnet',
      4: 'Rinkeby Testnet',
      5: 'Goerli Testnet',
      42: 'Kovan Testnet',
      11155111: 'Sepolia Testnet',
      1337: 'Local Hardhat',
      31337: 'Local Hardhat'
    };
    return networks[networkId] || `Unknown Network (${networkId})`;
  }
}

// Create global instance
window.web3Service = new Web3Service();





