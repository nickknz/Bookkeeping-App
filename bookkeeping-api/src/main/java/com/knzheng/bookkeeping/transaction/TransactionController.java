package com.knzheng.bookkeeping.transaction;

import com.knzheng.bookkeeping.common.exception.BusinessException;
import com.knzheng.bookkeeping.common.response.ApiResponse;
import com.knzheng.bookkeeping.common.response.PageResponse;
import com.knzheng.bookkeeping.common.security.CurrentUserProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final CurrentUserProvider currentUserProvider;

    public TransactionController(
        TransactionService transactionService,
        CurrentUserProvider currentUserProvider
    ) {
        this.transactionService = transactionService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public ApiResponse<PageResponse<TransactionResponse>> findPage(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) Integer categoryId,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "0") @Min(value = 0, message = "page 不能小于 0") int page,
        @RequestParam(defaultValue = "20")
        @Min(value = 1, message = "size 不能小于 1")
        @Max(value = 500, message = "size 不能大于 500") int size
    ) {
        return ApiResponse.success(transactionService.findPage(
            currentUserProvider.getCurrentUserId(),
            startDate,
            endDate,
            parseType(type),
            categoryId,
            keyword,
            page,
            size
        ));
    }

    @GetMapping("/{id}")
    public ApiResponse<TransactionResponse> findById(@PathVariable UUID id) {
        return ApiResponse.success(
            transactionService.findById(currentUserProvider.getCurrentUserId(), id)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> create(
            @Valid @RequestBody CreateTransactionRequest request
    ) {
        TransactionResponse response = transactionService.create(
            currentUserProvider.getCurrentUserId(),
            request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    public ApiResponse<TransactionResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTransactionRequest request
    ) {
        return ApiResponse.success(transactionService.update(
            currentUserProvider.getCurrentUserId(),
            id,
            request
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        transactionService.delete(currentUserProvider.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    private TransactionType parseType(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return TransactionType.fromValue(value);
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }
}
