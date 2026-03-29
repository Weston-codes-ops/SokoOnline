package com.westoncodesops.sokoonline.services.ProductService;

import com.westoncodesops.sokoonline.dtos.requests.ProductRequest;
import com.westoncodesops.sokoonline.dtos.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductServiceInterface {

    Page<ProductResponse> getAllActiveProducts(Pageable pageable);

    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);

    Page<ProductResponse> searchProducts(String name, Pageable pageable);

    ProductResponse getProductBySlug(String slug);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void delistProduct(Long id);

}
