// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AyurTechToken.sol";

contract CropMarketplace is Ownable, ReentrancyGuard {
    struct Listing {
        uint256 cropId;
        address seller;
        uint256 price;
        uint256 quantity;
        bool isActive;
        uint256 listingDate;
        string description;
    }
    
    struct Order {
        uint256 listingId;
        address buyer;
        uint256 quantity;
        uint256 totalPrice;
        bool isCompleted;
        uint256 orderDate;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public sellerListings;
    mapping(address => uint256[]) public buyerOrders;
    
    uint256 public listingCounter;
    uint256 public orderCounter;
    
    AyurTechToken public ayurToken;
    
    event CropListed(uint256 indexed listingId, address indexed seller, uint256 cropId, uint256 price);
    event OrderPlaced(uint256 indexed orderId, address indexed buyer, uint256 listingId, uint256 quantity);
    event OrderCompleted(uint256 indexed orderId, address indexed buyer, address indexed seller);
    event ListingCancelled(uint256 indexed listingId);
    
    constructor(address _ayurToken) {
        ayurToken = AyurTechToken(_ayurToken);
    }
    
    // List a crop for sale
    function listCrop(
        uint256 cropId,
        uint256 price,
        uint256 quantity,
        string memory description
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        require(quantity > 0, "Quantity must be greater than 0");
        
        uint256 listingId = listingCounter++;
        
        listings[listingId] = Listing({
            cropId: cropId,
            seller: msg.sender,
            price: price,
            quantity: quantity,
            isActive: true,
            listingDate: block.timestamp,
            description: description
        });
        
        sellerListings[msg.sender].push(listingId);
        
        emit CropListed(listingId, msg.sender, cropId, price);
        return listingId;
    }
    
    // Place an order
    function placeOrder(uint256 listingId, uint256 quantity) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(quantity <= listing.quantity, "Insufficient quantity");
        require(msg.sender != listing.seller, "Cannot buy own listing");
        
        uint256 totalPrice = listing.price * quantity;
        require(ayurToken.balanceOf(msg.sender) >= totalPrice, "Insufficient token balance");
        
        // Transfer tokens from buyer to contract
        ayurToken.transferFrom(msg.sender, address(this), totalPrice);
        
        uint256 orderId = orderCounter++;
        
        orders[orderId] = Order({
            listingId: listingId,
            buyer: msg.sender,
            quantity: quantity,
            totalPrice: totalPrice,
            isCompleted: false,
            orderDate: block.timestamp
        });
        
        buyerOrders[msg.sender].push(orderId);
        
        // Update listing quantity
        listing.quantity -= quantity;
        if (listing.quantity == 0) {
            listing.isActive = false;
        }
        
        emit OrderPlaced(orderId, msg.sender, listingId, quantity);
    }
    
    // Complete an order (seller confirms delivery)
    function completeOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        Listing storage listing = listings[order.listingId];
        
        require(listing.seller == msg.sender, "Not the seller");
        require(!order.isCompleted, "Order already completed");
        
        order.isCompleted = true;
        
        // Transfer tokens to seller
        ayurToken.transfer(msg.sender, order.totalPrice);
        
        emit OrderCompleted(orderId, order.buyer, msg.sender);
    }
    
    // Cancel a listing
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");
        
        listing.isActive = false;
        
        emit ListingCancelled(listingId);
    }
    
    // Get listing details
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
    
    // Get order details
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
    
    // Get seller's listings
    function getSellerListings(address seller) external view returns (uint256[] memory) {
        return sellerListings[seller];
    }
    
    // Get buyer's orders
    function getBuyerOrders(address buyer) external view returns (uint256[] memory) {
        return buyerOrders[buyer];
    }
    
    // Get active listings
    function getActiveListings() external view returns (uint256[] memory) {
        uint256[] memory activeListings = new uint256[](listingCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < listingCounter; i++) {
            if (listings[i].isActive) {
                activeListings[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeListings[i];
        }
        
        return result;
    }
}





