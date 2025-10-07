class BlockchainIntegration {
  constructor() {
    this.web3Service = window.web3Service;
    this.isBlockchainEnabled = false;
  }

  // Initialize blockchain features
  async init() {
    try {
      const connected = await this.web3Service.init();
      if (connected) {
        await this.web3Service.loadContracts();
        this.isBlockchainEnabled = true;
        this.setupBlockchainUI();
        this.loadBlockchainData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error);
      return false;
    }
  }

  // Setup blockchain UI elements
  setupBlockchainUI() {
    // Add blockchain status to header
    this.addBlockchainStatus();
    
    // Add token balance display
    this.addTokenBalance();
    
    // Add blockchain features to dashboard
    this.addBlockchainFeatures();
    
    // Add marketplace section
    this.addMarketplaceSection();
  }

  // Add blockchain status indicator
  addBlockchainStatus() {
    const header = document.querySelector('.header');
    if (header) {
      const blockchainStatus = document.createElement('div');
      blockchainStatus.className = 'blockchain-status';
      blockchainStatus.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; background: #e8f5e8; padding: 8px 15px; border-radius: 20px; border: 2px solid #28a745;">
          <div style="width: 8px; height: 8px; background: #28a745; border-radius: 50%; animation: pulse 2s infinite;"></div>
          <span style="color: #28a745; font-weight: 600; font-size: 0.9rem;">Blockchain Connected</span>
          <span style="color: #666; font-size: 0.8rem;" id="userAddress">${this.web3Service.userAddress.slice(0, 6)}...${this.web3Service.userAddress.slice(-4)}</span>
        </div>
      `;
      
      const navButtons = header.querySelector('.nav-buttons');
      if (navButtons) {
        navButtons.insertBefore(blockchainStatus, navButtons.firstChild);
      }
    }
  }

  // Add token balance display
  addTokenBalance() {
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
      const tokenBalanceCard = document.createElement('div');
      tokenBalanceCard.className = 'stat-card';
      tokenBalanceCard.innerHTML = `
        <div class="stat-icon">🪙</div>
        <div class="stat-number" id="tokenBalance">0</div>
        <div class="stat-label">AYUR Tokens</div>
      `;
      statsContainer.appendChild(tokenBalanceCard);
    }
  }

  // Add blockchain features to dashboard
  addBlockchainFeatures() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      const blockchainSection = document.createElement('div');
      blockchainSection.className = 'blockchain-section';
      blockchainSection.innerHTML = `
        <div class="section-header">
          <h3>🔗 Blockchain Features</h3>
        </div>
        
        <div class="blockchain-features">
          <div class="feature-card" onclick="blockchainIntegration.registerCropOnBlockchain()">
            <div class="feature-icon">🌾</div>
            <h4>Register Crop</h4>
            <p>Register your crop on blockchain for transparency</p>
          </div>
          
          <div class="feature-card" onclick="blockchainIntegration.recordDiseaseOnBlockchain()">
            <div class="feature-icon">🔬</div>
            <h4>Record Disease</h4>
            <p>Record disease detection on immutable ledger</p>
          </div>
          
          <div class="feature-card" onclick="blockchainIntegration.recordHarvestOnBlockchain()">
            <div class="feature-icon">📊</div>
            <h4>Record Harvest</h4>
            <p>Record harvest data for supply chain tracking</p>
          </div>
          
          <div class="feature-card" onclick="blockchainIntegration.viewMyCrops()">
            <div class="feature-icon">📋</div>
            <h4>My Crops</h4>
            <p>View your blockchain-registered crops</p>
          </div>
        </div>
      `;
      
      mainContent.appendChild(blockchainSection);
    }
  }

  // Add marketplace section
  addMarketplaceSection() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      const marketplaceSection = document.createElement('div');
      marketplaceSection.className = 'marketplace-section';
      marketplaceSection.innerHTML = `
        <div class="section-header">
          <h3>🏪 Decentralized Marketplace</h3>
        </div>
        
        <div class="marketplace-actions">
          <button class="btn btn-primary" onclick="blockchainIntegration.openMarketplace()">
            Browse Marketplace
          </button>
          <button class="btn btn-secondary" onclick="blockchainIntegration.listMyCrop()">
            List My Crop
          </button>
        </div>
        
        <div id="marketplaceListings" class="marketplace-listings">
          <!-- Marketplace listings will be loaded here -->
        </div>
      `;
      
      mainContent.appendChild(marketplaceSection);
    }
  }

  // Load blockchain data
  async loadBlockchainData() {
    try {
      // Load token balance
      const balance = await this.web3Service.getTokenBalance();
      const balanceElement = document.getElementById('tokenBalance');
      if (balanceElement) {
        balanceElement.textContent = parseFloat(balance).toFixed(2);
      }

      // Load farmer verification status
      const isVerified = await this.web3Service.isFarmerVerified();
      if (isVerified) {
        this.showVerificationBadge();
      }

      // Load farmer rewards
      const rewards = await this.web3Service.getFarmerRewards();
      if (rewards > 0) {
        this.showRewardsNotification(rewards);
      }

      // Load marketplace listings
      await this.loadMarketplaceListings();
    } catch (error) {
      console.error('❌ Failed to load blockchain data:', error);
    }
  }

  // Show verification badge
  showVerificationBadge() {
    const header = document.querySelector('.header');
    if (header) {
      const verificationBadge = document.createElement('div');
      verificationBadge.className = 'verification-badge';
      verificationBadge.innerHTML = `
        <div style="display: flex; align-items: center; gap: 5px; background: #fff3cd; padding: 5px 10px; border-radius: 15px; border: 1px solid #ffc107;">
          <span style="color: #856404;">✅</span>
          <span style="color: #856404; font-size: 0.8rem; font-weight: 600;">Verified Farmer</span>
        </div>
      `;
      
      const blockchainStatus = header.querySelector('.blockchain-status');
      if (blockchainStatus) {
        blockchainStatus.appendChild(verificationBadge);
      }
    }
  }

  // Show rewards notification
  showRewardsNotification(rewards) {
    this.web3Service.showNotification(`You have earned ${rewards} AYUR tokens! 🎉`);
  }

  // Register crop on blockchain
  async registerCropOnBlockchain() {
    const cropName = prompt('Enter crop name:');
    if (!cropName) return;

    const cropData = {
      name: cropName,
      hindi: prompt('Enter Hindi name:') || cropName,
      scientificName: prompt('Enter scientific name:') || 'Unknown',
      category: prompt('Enter category (Cereal/Vegetable/Fruit):') || 'Crop',
      expectedHarvest: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days from now
      location: prompt('Enter location:') || 'Unknown'
    };

    try {
      const cropId = await this.web3Service.registerCrop(cropData);
      if (cropId) {
        this.web3Service.showNotification(`Crop registered successfully! ID: ${cropId}`);
        await this.loadBlockchainData();
      }
    } catch (error) {
      console.error('❌ Failed to register crop:', error);
      alert('Failed to register crop on blockchain');
    }
  }

  // Record disease on blockchain
  async recordDiseaseOnBlockchain() {
    const cropId = prompt('Enter crop ID:');
    if (!cropId) return;

    const diseaseData = {
      name: prompt('Enter disease name:'),
      symptoms: prompt('Enter symptoms:'),
      treatment: prompt('Enter treatment:')
    };

    if (!diseaseData.name || !diseaseData.symptoms || !diseaseData.treatment) {
      alert('All fields are required');
      return;
    }

    try {
      const success = await this.web3Service.recordDisease(cropId, diseaseData);
      if (success) {
        this.web3Service.showNotification('Disease recorded on blockchain');
      }
    } catch (error) {
      console.error('❌ Failed to record disease:', error);
      alert('Failed to record disease on blockchain');
    }
  }

  // Record harvest on blockchain
  async recordHarvestOnBlockchain() {
    const cropId = prompt('Enter crop ID:');
    if (!cropId) return;

    const yield = prompt('Enter yield (in kg):');
    if (!yield || isNaN(yield)) {
      alert('Please enter a valid yield amount');
      return;
    }

    try {
      const success = await this.web3Service.recordHarvest(cropId, parseInt(yield));
      if (success) {
        this.web3Service.showNotification('Harvest recorded on blockchain');
      }
    } catch (error) {
      console.error('❌ Failed to record harvest:', error);
      alert('Failed to record harvest on blockchain');
    }
  }

  // View my crops
  async viewMyCrops() {
    try {
      const crops = await this.web3Service.getFarmerCrops();
      this.showMyCropsModal(crops);
    } catch (error) {
      console.error('❌ Failed to load crops:', error);
      alert('Failed to load your crops');
    }
  }

  // Show my crops modal
  showMyCropsModal(crops) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px;">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <div class="camera-container">
          <h3>🌾 My Blockchain Crops</h3>
          <div style="max-height: 500px; overflow-y: auto;">
            ${crops.length === 0 ? 
              '<p style="text-align: center; color: #666; padding: 40px;">No crops registered on blockchain yet.</p>' :
              crops.map(crop => `
                <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid #00baf2;">
                  <h4 style="color: #333; margin-bottom: 10px;">
                    ${crop.name} (${crop.hindi}) - ID: ${crop.id}
                  </h4>
                  <p><strong>Category:</strong> ${crop.category}</p>
                  <p><strong>Location:</strong> ${crop.location}</p>
                  <p><strong>Planting Date:</strong> ${new Date(crop.plantingDate * 1000).toLocaleDateString()}</p>
                  <p><strong>Expected Harvest:</strong> ${new Date(crop.expectedHarvest * 1000).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> ${crop.isHarvested ? 'Harvested' : 'Growing'}</p>
                  ${crop.isHarvested ? `<p><strong>Yield:</strong> ${crop.yield} kg</p>` : ''}
                </div>
              `).join('')
            }
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Open marketplace
  async openMarketplace() {
    try {
      const listings = await this.web3Service.getActiveListings();
      this.showMarketplaceModal(listings);
    } catch (error) {
      console.error('❌ Failed to load marketplace:', error);
      alert('Failed to load marketplace');
    }
  }

  // Show marketplace modal
  showMarketplaceModal(listings) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 900px;">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <div class="camera-container">
          <h3>🏪 Decentralized Crop Marketplace</h3>
          <div style="max-height: 500px; overflow-y: auto;">
            ${listings.length === 0 ? 
              '<p style="text-align: center; color: #666; padding: 40px;">No active listings available.</p>' :
              listings.map(listing => `
                <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid #28a745;">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <h4 style="color: #333; margin-bottom: 10px;">
                        Listing #${listing.id} - Crop ID: ${listing.cropId}
                      </h4>
                      <p><strong>Price:</strong> ${listing.price} AYUR tokens</p>
                      <p><strong>Quantity:</strong> ${listing.quantity}</p>
                      <p><strong>Description:</strong> ${listing.description}</p>
                      <p><strong>Seller:</strong> ${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}</p>
                    </div>
                    <button class="btn btn-primary" onclick="blockchainIntegration.buyCrop(${listing.id}, ${listing.price})">
                      Buy Now
                    </button>
                  </div>
                </div>
              `).join('')
            }
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Buy crop
  async buyCrop(listingId, price) {
    const quantity = prompt(`Enter quantity to buy (Price: ${price} AYUR tokens per unit):`);
    if (!quantity || isNaN(quantity)) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      const orderId = await this.web3Service.placeOrder(listingId, parseInt(quantity));
      if (orderId) {
        this.web3Service.showNotification(`Order placed successfully! Order ID: ${orderId}`);
      }
    } catch (error) {
      console.error('❌ Failed to place order:', error);
      alert('Failed to place order');
    }
  }

  // List my crop
  async listMyCrop() {
    const cropId = prompt('Enter crop ID to list:');
    if (!cropId) return;

    const price = prompt('Enter price per unit (in AYUR tokens):');
    if (!price || isNaN(price)) {
      alert('Please enter a valid price');
      return;
    }

    const quantity = prompt('Enter quantity available:');
    if (!quantity || isNaN(quantity)) {
      alert('Please enter a valid quantity');
      return;
    }

    const description = prompt('Enter description:') || 'Fresh crop from verified farmer';

    try {
      const listingId = await this.web3Service.listCrop(cropId, price, quantity, description);
      if (listingId) {
        this.web3Service.showNotification(`Crop listed successfully! Listing ID: ${listingId}`);
      }
    } catch (error) {
      console.error('❌ Failed to list crop:', error);
      alert('Failed to list crop');
    }
  }

  // Load marketplace listings
  async loadMarketplaceListings() {
    try {
      const listings = await this.web3Service.getActiveListings();
      const listingsContainer = document.getElementById('marketplaceListings');
      if (listingsContainer) {
        listingsContainer.innerHTML = listings.length === 0 ? 
          '<p style="text-align: center; color: #666; padding: 20px;">No active listings available.</p>' :
          listings.slice(0, 3).map(listing => `
            <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid #28a745;">
              <h4 style="color: #333; margin-bottom: 10px;">Crop ID: ${listing.cropId}</h4>
              <p><strong>Price:</strong> ${listing.price} AYUR tokens</p>
              <p><strong>Quantity:</strong> ${listing.quantity}</p>
              <p><strong>Description:</strong> ${listing.description}</p>
            </div>
          `).join('');
      }
    } catch (error) {
      console.error('❌ Failed to load marketplace listings:', error);
    }
  }
}

// Create global instance
window.blockchainIntegration = new BlockchainIntegration();





