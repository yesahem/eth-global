// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MemoryEconomics
 * @dev Library for handling payment and economic operations in the memory system
 */
library MemoryEconomics {
    // Custom errors
    error InsufficientPayment(uint256 sent, uint256 required);
    error WithdrawalFailed();
    error NoFundsToWithdraw();

    /**
     * @dev Validates that sufficient payment was sent
     * @param sent The amount sent
     * @param required The required amount
     */
    function validatePayment(uint256 sent, uint256 required) internal pure {
        if (sent < required) {
            revert InsufficientPayment(sent, required);
        }
    }

    /**
     * @dev Processes a payment for access
     * @param minPayment The minimum payment required
     * @return excessAmount Any excess payment that should be refunded
     */
    function processPayment(uint256 minPayment) internal view returns (uint256 excessAmount) {
        validatePayment(msg.value, minPayment);
        
        // Calculate excess amount for potential refund
        if (msg.value > minPayment) {
            excessAmount = msg.value - minPayment;
        } else {
            excessAmount = 0;
        }
        
        return excessAmount;
    }

    /**
     * @dev Safely withdraws funds to a recipient
     * @param recipient The address to send funds to
     * @param amount The amount to withdraw
     */
    function withdrawFunds(address payable recipient, uint256 amount) internal {
        if (amount == 0) {
            revert NoFundsToWithdraw();
        }
        
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) {
            revert WithdrawalFailed();
        }
    }

    /**
     * @dev Refunds excess payment to sender
     * @param recipient The address to refund to
     * @param amount The amount to refund
     */
    function refundExcess(address payable recipient, uint256 amount) internal {
        if (amount > 0) {
            (bool success, ) = recipient.call{value: amount}("");
            // Note: We don't revert on refund failure to avoid DoS attacks
            // The excess amount stays in the contract in this case
        }
    }

    /**
     * @dev Calculates dynamic pricing based on demand
     * @param basePrice The base price
     * @param demandMultiplier The demand multiplier (in basis points, 10000 = 100%)
     * @return adjustedPrice The price adjusted for demand
     */
    function calculateDynamicPrice(
        uint256 basePrice, 
        uint256 demandMultiplier
    ) internal pure returns (uint256 adjustedPrice) {
        return (basePrice * demandMultiplier) / 10000;
    }

    /**
     * @dev Calculates fee for memory operations based on size
     * @param memorySize The size of the memory in bytes
     * @param baseFeePerByte The base fee per byte
     * @return fee The calculated fee
     */
    function calculateMemoryFee(
        uint256 memorySize,
        uint256 baseFeePerByte
    ) internal pure returns (uint256 fee) {
        return memorySize * baseFeePerByte;
    }

    /**
     * @dev Applies discount based on user tier or loyalty
     * @param originalAmount The original amount before discount
     * @param discountBasisPoints The discount in basis points (100 = 1%, 10000 = 100%)
     * @return discountedAmount The amount after applying discount
     */
    function applyDiscount(
        uint256 originalAmount,
        uint256 discountBasisPoints
    ) internal pure returns (uint256 discountedAmount) {
        require(discountBasisPoints <= 10000, "Invalid discount percentage");
        
        uint256 discountAmount = (originalAmount * discountBasisPoints) / 10000;
        return originalAmount - discountAmount;
    }
}