package com.knzheng.bookkeeping.transaction;

import com.knzheng.bookkeeping.category.CategoryResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        Integer categoryId,
        BigDecimal amount,
        TransactionType type,
        String note,
        LocalDate date,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        CategoryResponse category
) {
    public static TransactionResponse from(TransactionRow row) {
        CategoryResponse category = new CategoryResponse(
                row.getCategoryId(),
                row.getCategoryCode(),
                row.getCategoryName(),
                row.getCategoryIcon(),
                row.getCategoryType()
        );
        return new TransactionResponse(
                row.getId(),
                row.getCategoryId(),
                row.getAmount(),
                TransactionType.fromValue(row.getType()),
                row.getNote(),
                row.getDate(),
                row.getCreatedAt(),
                row.getUpdatedAt(),
                category
        );
    }
}
