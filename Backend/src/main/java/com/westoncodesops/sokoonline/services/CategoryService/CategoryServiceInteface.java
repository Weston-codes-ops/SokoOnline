package com.westoncodesops.sokoonline.services.CategoryService;

import com.westoncodesops.sokoonline.dtos.requests.CategoryRequest;
import com.westoncodesops.sokoonline.dtos.response.CategoryResponse;

import java.util.List;

public interface CategoryServiceInteface {

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryBySlug(String slug);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

}
