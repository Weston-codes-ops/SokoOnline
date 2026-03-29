package com.westoncodesops.sokoonline.dtos.response;

public record SubcategoryResponse(    Long id,
                                      String name,
                                      String slug,
                                      String description,
                                      Long categoryId,
                                      String categoryName) {

}
