package com.westoncodesops.sokoonline.repositories;

import com.westoncodesops.sokoonline.entities.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface Promotionrepository extends JpaRepository<Promotion, Long> {

    /**
     * Fetch all promotions that are:
     * - active = true
     * - current time is between startDate and endDate
     *
     * This is what the homepage promo section uses.
     */
    @Query("SELECT p FROM Promotion p WHERE p.active = true AND p.startDate <= :now AND p.endDate >= :now")
    List<Promotion> findActivePromotions(LocalDateTime now);

    // Find all promotions for a specific product
    List<Promotion> findByProductId(Long productId);
}
