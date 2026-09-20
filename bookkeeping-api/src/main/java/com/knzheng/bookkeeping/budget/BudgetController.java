package com.knzheng.bookkeeping.budget;

import com.knzheng.bookkeeping.common.response.ApiResponse;
import com.knzheng.bookkeeping.common.security.CurrentUserProvider;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final CurrentUserProvider currentUserProvider;

    public BudgetController(
            BudgetService budgetService,
            CurrentUserProvider currentUserProvider
    ) {
        this.budgetService = budgetService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public ApiResponse<BudgetResponse> findByMonth(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month
    ) {
        return ApiResponse.success(
                budgetService.findByMonth(currentUserProvider.getCurrentUserId(), month)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> create(
            @Valid @RequestBody CreateBudgetRequest request
    ) {
        BudgetResponse response = budgetService.create(
                currentUserProvider.getCurrentUserId(),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    public ApiResponse<BudgetResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBudgetRequest request
    ) {
        return ApiResponse.success(budgetService.update(
                currentUserProvider.getCurrentUserId(),
                id,
                request
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        budgetService.delete(currentUserProvider.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
