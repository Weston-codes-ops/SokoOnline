package com.westoncodesops.sokoonline.services.PromotionService;

import com.westoncodesops.sokoonline.dtos.requests.PromotionRequest;
import com.westoncodesops.sokoonline.dtos.response.PromotionResponse;
import com.westoncodesops.sokoonline.entities.Promotion;
import com.westoncodesops.sokoonline.entities.Product;
import com.westoncodesops.sokoonline.repositories.PromotionRepository;
import com.westoncodesops.sokoonline.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionService implements PromotionServiceInterface {

    private final PromotionRepository promotionRepository;
    private final ProductRepository   productRepository;

    @Override
    public List<PromotionResponse> getActivePromotions() {
        return promotionRepository
                .findActivePromotions(LocalDateTime.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PromotionResponse create(PromotionRequest req) {
        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Promotion promo = Promotion.builder()
                .product(product)
                .badge(req.badge())
                .discountPercent(req.discountPercent())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .active(req.active())
                .build();

        return toResponse(promotionRepository.save(promo));
    }

    @Override
    public PromotionResponse update(Long id, PromotionRequest req) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));

        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        promo.setProduct(product);
        promo.setBadge(req.badge());
        promo.setDiscountPercent(req.discountPercent());
        promo.setStartDate(req.startDate());
        promo.setEndDate(req.endDate());
        promo.setActive(req.active());

        return toResponse(promotionRepository.save(promo));
    }

    @Override
    public void delete(Long id) {
        promotionRepository.deleteById(id);
    }

    // Map entity to DTO
    private PromotionResponse toResponse(Promotion p) {
        return new PromotionResponse(
                p.getId(),
                p.getProduct().getId(),
                p.getProduct().getName(),
                p.getProduct().getSlug(),
                p.getProduct().getImageUrl(),
                p.getProduct().getPrice(),
                p.getProduct().getCategory().getName(),
                p.getBadge(),
                p.getDiscountPercent(),
                p.getEndDate()
        );
    }
}
