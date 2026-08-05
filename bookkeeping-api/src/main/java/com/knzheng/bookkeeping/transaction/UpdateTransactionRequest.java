package com.knzheng.bookkeeping.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateTransactionRequest(
        @NotNull(message = "categoryId 不能为空")
        Integer categoryId,

        @NotNull(message = "amount 不能为空")
        @DecimalMin(value = "0.01", message = "amount 必须大于 0")
        @Digits(integer = 10, fraction = 2, message = "amount 最多支持 10 位整数和 2 位小数")
        BigDecimal amount,

        @NotNull(message = "type 不能为空")
        TransactionType type,

        @Size(max = 500, message = "note 不能超过 500 个字符")
        String note,

        @NotNull(message = "date 不能为空")
        LocalDate date
) {
}
