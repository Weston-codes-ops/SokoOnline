package com.westoncodesops.sokoonline.services.ProductService;

import com.westoncodesops.sokoonline.entities.Category;
import com.westoncodesops.sokoonline.entities.Product;
import com.westoncodesops.sokoonline.entities.Subcategory;
import com.westoncodesops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodesops.sokoonline.repositories.CategoryRepository;
import com.westoncodesops.sokoonline.repositories.ProductRepository;
import com.westoncodesops.sokoonline.dtos.requests.ProductRequest;
import com.westoncodesops.sokoonline.dtos.response.ProductResponse;
import com.westoncodesops.sokoonline.repositories.Subcategoryrepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService implements ProductServiceInterface {


    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final Subcategoryrepository subcategoryRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String name, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(name, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + slug));
        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));

        Subcategory subcategory = null;
        if (request.subcategoryId() != null) {
            subcategory = subcategoryRepository.findById(request.subcategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found: " + request.subcategoryId()));
        }

        String slug = generateSlug(request.name());
        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Product product = Product.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .price(request.price())
                .stockQuantity(request.stockQuantity())
                .imageUrl(request.imageUrl())
                .category(category)
                .subcategory(subcategory)
                .active(true)
                .build();

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));

        Subcategory subcategory = null;
        if (request.subcategoryId() != null) {
            subcategory = subcategoryRepository.findById(request.subcategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found: " + request.subcategoryId()));
        }

        product.setName(request.name());
        product.setSlug(generateSlug(request.name()));
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setImageUrl(request.imageUrl());
        product.setCategory(category);
        product.setSubcategory(subcategory);

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delistProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setActive(false);
        productRepository.save(product);
    }


    private String generateSlug(String name) {
        return name.toLowerCase().trim().replaceAll("\\s+", "-");
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getSlug(), p.getDescription(),
                p.getPrice(), p.getStockQuantity(), p.getImageUrl(),
                p.getActive(),
                p.getCategory().getId(),
                p.getCategory().getName(),
                p.getSubcategory() != null ? p.getSubcategory().getName() : null
        );
    }
}
