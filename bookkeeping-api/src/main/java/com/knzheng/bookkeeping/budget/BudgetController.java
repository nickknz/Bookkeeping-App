package com.knzheng.bookkeeping.category;

import com.knzheng.bookkeeping.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetservice;
    private final CurrentUserProvider currentUserProvider;

    public BudgetController(
        BudgetService budgetservice,
        CurrentUserProvider currentUserProvider
    ) {
        this.budgetservice = budgetservice;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/current-month")
    public ApiResponse<List<BudgetResponse>> findCurrentMonth(
        @RequestParam(required = false) String type
    ) {
        // TODO
    }

    @GetMapping
    public ApiResponse<List<BudgetResponse>> findAll(
        @RequestParam(required = false) String type
    ) {
        return ApiResponse.success(budgetservice.findAll(type));
    }

    @GetMapping("/{id}")
    public ApiResponse<TransactionResponse> findById(@PathVariable UUID id) {
        // TODO
        return ApiResponse.success(
            transactionService.findById(currentUserProvider.getCurrentUserId(), id)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> create(
        @Valid @RequestBody CreateTransactionRequest request
    ) {
        // TODO
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
        // TODO
        return ApiResponse.success(transactionService.update(
            currentUserProvider.getCurrentUserId(),
            id,
            request
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        // TODO
        transactionService.delete(currentUserProvider.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
