package com.westoncodesops.sokoonline.controllers;

import com.westoncodesops.sokoonline.dtos.requests.Promotionrequest;
import com.westoncodesops.sokoonline.dtos.response.Promotionresponse;
import com.westoncodesops.sokoonline.services.PromotionService.PromotionServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionServiceInterface promotionService;

    // Public — homepage fetches this to show promo section
    @GetMapping("/active")
    public ResponseEntity<List<Promotionresponse>> getActive() {
        return ResponseEntity.ok(promotionService.getActivePromotions());
    }

    // Admin only — see all promotions including expired
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Promotionresponse>> getAll() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Promotionresponse> create(@Valid @RequestBody Promotionrequest req) {
        return ResponseEntity.ok(promotionService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Promotionresponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody Promotionrequest req) {
        return ResponseEntity.ok(promotionService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promotionService.delete(id); // handled by service
        return ResponseEntity.noContent().build();
    }
}
