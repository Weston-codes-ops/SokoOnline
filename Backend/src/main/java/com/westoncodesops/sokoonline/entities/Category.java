package com.westoncodesops.sokoonline.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;


@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Entity
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    /**
     * SEO-friendly URL segment, e.g. "mens-shoes".
     * Generate on save: name.toLowerCase().replaceAll("\\s+", "-")
     */
    @Column(nullable = false, unique = true)
    private String slug;

    @Column(length = 500)
    private String description;

    // A category can have many products
    @OneToMany(mappedBy = "category")
    private List<Product> products;

}
