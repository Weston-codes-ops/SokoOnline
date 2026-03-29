package com.westoncodesops.sokoonline.repositories;

import com.westoncodesops.sokoonline.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    void deleteByCartIdAndProductId(Long cartId, Long productId);
}
