package com.westoncodesops.sokoonline.services.PromotionService;

import com.westoncodesops.sokoonline.dtos.requests.PromotionRequest;
import com.westoncodesops.sokoonline.dtos.response.PromotionResponse;
import java.util.List;

public interface PromotionServiceInterface {
    List<PromotionResponse> getActivePromotions();
    List<PromotionResponse> getAllPromotions();       // Admin — all including expired
    PromotionResponse create(PromotionRequest req);
    PromotionResponse update(Long id, PromotionRequest req);
    void delete(Long id);
}
