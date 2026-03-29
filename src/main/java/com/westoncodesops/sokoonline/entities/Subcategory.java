package com.westoncodesops.sokoonline.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "subcategories")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Subcategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(length = 500)
    private String description;

    // Many subcategories belong to one category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // One subcategory has many products
    @OneToMany(mappedBy = "subcategory")
    private List<Product> products;
}
