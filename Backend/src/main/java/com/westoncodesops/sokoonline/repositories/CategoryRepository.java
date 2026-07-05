package com.westoncodesops.sokoonline.repositories;

import com.westoncodesops.sokoonline.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository <Category, Long> {

Optional<Category> findBySlug(String slug); // e.g. GET /categories/mens-shoes
boolean existsByName(String name);


}
