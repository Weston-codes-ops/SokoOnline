package com.westoncodesops.sokoonline.services.SubcategoryService;

import com.westoncodesops.sokoonline.dtos.requests.SubcategoryRequest;
import com.westoncodesops.sokoonline.dtos.response.SubcategoryResponse;

import java.util.List;

public interface SubcategoryserviceInterface {
    List<SubcategoryResponse> getAllSubcategories();
    List<SubcategoryResponse> getSubcategoriesByCategory(Long categoryId);
    SubcategoryResponse createSubcategory(SubcategoryRequest request);
    SubcategoryResponse updateSubcategory(Long id, SubcategoryRequest request);
    void deleteSubcategory(Long id);
}
