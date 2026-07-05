package com.westoncodesops.sokoonline.repositories;

import com.westoncodesops.sokoonline.entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository <Product, Long> {
    Optional<Product> findBySlug(String slug); // e.g. GET /products/nike-air-max-90

    // Only return active (listed) products to customers
    Page<Product> findByActiveTrue(Pageable pageable);

    // Filter by category — paginated for large catalogs
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    // Basic search by name — case-insensitive contains
    Page<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name, Pageable pageable);

    // Combined: search within a category
    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
          AND p.category.id = :categoryId
          AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
        """)
    Page<Product> searchByCategoryAndName(
            @Param("categoryId") Long categoryId,
            @Param("name") String name,
            Pageable pageable
    );

    boolean existsBySlug(String slug);

}
