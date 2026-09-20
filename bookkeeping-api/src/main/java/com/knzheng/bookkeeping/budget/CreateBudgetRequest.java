package com.knzheng.bookkeeping.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateBudgetRequest(
        @NotNull(message = "month 不能为空")
        LocalDate month,

        @NotNull(message = "limitAmount 不能为空")
        @DecimalMin(value = "0.01", message = "limitAmount 必须大于 0")
        @Digits(integer = 10, fraction = 2, message = "limitAmount 最多支持 10 位整数和 2 位小数")
        BigDecimal limitAmount
) {
}
