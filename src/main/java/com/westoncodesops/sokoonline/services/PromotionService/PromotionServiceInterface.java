package com.westoncodesops.sokoonline.services.PromotionService;

import com.westoncodesops.sokoonline.dtos.requests.Promotionrequest;
import com.westoncodesops.sokoonline.dtos.response.Promotionresponse;
import java.util.List;

public interface PromotionServiceInterface {
    List<Promotionresponse> getActivePromotions();
    List<Promotionresponse> getAllPromotions();       // Admin — all including expired
    Promotionresponse create(Promotionrequest req);
    Promotionresponse update(Long id, Promotionrequest req);
    void delete(Long id);
}
