package com.westoncodesops.sokoonline.services.CategoryService;

import com.westoncodesops.sokoonline.entities.Category;
import com.westoncodesops.sokoonline.repositories.CategoryRepository;
import com.westoncodesops.sokoonline.dtos.requests.CategoryRequest;
import com.westoncodesops.sokoonline.dtos.response.CategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService implements CategoryServiceInteface{

    private final CategoryRepository categoryRepository;


    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found: " + slug));
        return toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Category already exists: " + request.name());
        }
        Category category = Category.builder()
                .name(request.name())
                .slug(generateSlug(request.name()))
                .description(request.description())
                .build();
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
        category.setName(request.name());
        category.setSlug(generateSlug(request.name()));
        category.setDescription(request.description());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private String generateSlug(String name) {
        return name.toLowerCase().trim().replaceAll("\\s+", "-");
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getSlug(), c.getDescription());
    }
}
