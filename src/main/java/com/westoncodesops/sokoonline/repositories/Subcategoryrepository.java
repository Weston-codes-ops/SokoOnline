package com.westoncodesops.sokoonline.repositories;


import com.westoncodesops.sokoonline.entities.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface Subcategoryrepository extends JpaRepository<Subcategory, Long> {
    List<Subcategory> findByCategoryId(Long categoryId);
    Optional<Subcategory> findBySlug(String slug);
    boolean existsByNameAndCategoryId(String name, Long categoryId);
}
