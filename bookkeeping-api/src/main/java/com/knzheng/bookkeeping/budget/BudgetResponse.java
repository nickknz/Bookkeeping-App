package com.knzheng.bookkeeping.budget;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record BudgetResponse(
        UUID id,
        LocalDate month,
        BigDecimal limitAmount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static BudgetResponse from(BudgetEntity entity) {
        return new BudgetResponse(
                entity.getId(),
                entity.getMonth(),
                entity.getLimitAmount(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
