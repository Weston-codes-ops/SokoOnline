package com.westoncodesops.sokoonline.services.SubcategoryService;


import com.westoncodesops.sokoonline.dtos.requests.SubcategoryRequest;
import com.westoncodesops.sokoonline.dtos.response.SubcategoryResponse;
import com.westoncodesops.sokoonline.entities.Category;
import com.westoncodesops.sokoonline.entities.Subcategory;
import com.westoncodesops.sokoonline.exceptions.BadRequestException;
import com.westoncodesops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodesops.sokoonline.repositories.CategoryRepository;
import com.westoncodesops.sokoonline.repositories.Subcategoryrepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubcategoryService implements SubcategoryserviceInterface{

    private final Subcategoryrepository subcategoryRepository;
    private final CategoryRepository categoryRepository;


    @Override
    @Transactional(readOnly = true)
    public List<SubcategoryResponse> getAllSubcategories() {
        return subcategoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubcategoryResponse> getSubcategoriesByCategory(Long categoryId) {
        return subcategoryRepository.findByCategoryId(categoryId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public SubcategoryResponse createSubcategory(SubcategoryRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (subcategoryRepository.existsByNameAndCategoryId(request.name(), request.categoryId())) {
            throw new BadRequestException("Subcategory already exists in this category");
        }

        Subcategory subcategory = Subcategory.builder()
                .name(request.name())
                .slug(generateSlug(request.name()))
                .description(request.description())
                .category(category)
                .build();

        return toResponse(subcategoryRepository.save(subcategory));
    }

    @Override
    @Transactional
    public SubcategoryResponse updateSubcategory(Long id, SubcategoryRequest request) {
        Subcategory subcategory = subcategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        subcategory.setName(request.name());
        subcategory.setSlug(generateSlug(request.name()));
        subcategory.setDescription(request.description());
        subcategory.setCategory(category);

        return toResponse(subcategoryRepository.save(subcategory));
    }

    @Override
    @Transactional
    public void deleteSubcategory(Long id) {
        if (!subcategoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subcategory not found");
        }
        subcategoryRepository.deleteById(id);
    }

    private String generateSlug(String name) {
        return name.toLowerCase().trim().replaceAll("\\s+", "-");
    }

    private SubcategoryResponse toResponse(Subcategory s) {
        return new SubcategoryResponse(
                s.getId(), s.getName(), s.getSlug(),
                s.getDescription(), s.getCategory().getId(), s.getCategory().getName()
        );
    }
}
