package com.knzheng.bookkeeping.budget;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.knzheng.bookkeeping.common.exception.BusinessException;
import com.knzheng.bookkeeping.common.exception.ResourceNotFoundException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetMapper budgetMapper;

    public BudgetService(BudgetMapper budgetMapper) {
        this.budgetMapper = budgetMapper;
    }

    public BudgetResponse findByMonth(UUID userId, LocalDate requestedMonth) {
        LocalDate month = requestedMonth == null
                ? LocalDate.now().withDayOfMonth(1)
                : requireMonthStart(requestedMonth);
        BudgetEntity entity = budgetMapper.selectOne(new LambdaQueryWrapper<BudgetEntity>()
                .eq(BudgetEntity::getUserId, userId)
                .eq(BudgetEntity::getMonth, month));
        return entity == null ? null : BudgetResponse.from(entity);
    }

    @Transactional
    public BudgetResponse create(UUID userId, CreateBudgetRequest request) {
        LocalDate month = requireMonthStart(request.month());
        if (exists(userId, month)) {
            throw duplicateBudget();
        }

        LocalDateTime now = LocalDateTime.now();
        BudgetEntity entity = new BudgetEntity();
        entity.setId(UUID.randomUUID());
        entity.setUserId(userId);
        entity.setMonth(month);
        entity.setLimitAmount(request.limitAmount());
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        try {
            budgetMapper.insert(entity);
        } catch (DuplicateKeyException exception) {
            throw duplicateBudget();
        }
        return BudgetResponse.from(entity);
    }

    @Transactional
    public BudgetResponse update(UUID userId, UUID id, UpdateBudgetRequest request) {
        requireBudget(userId, id);

        LambdaUpdateWrapper<BudgetEntity> scope = new LambdaUpdateWrapper<BudgetEntity>()
                .eq(BudgetEntity::getId, id)
                .eq(BudgetEntity::getUserId, userId)
                .set(BudgetEntity::getLimitAmount, request.limitAmount())
                .set(BudgetEntity::getUpdatedAt, LocalDateTime.now());
        if (budgetMapper.update(null, scope) != 1) {
            throw new ResourceNotFoundException("预算不存在");
        }
        return BudgetResponse.from(requireBudget(userId, id));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        LambdaUpdateWrapper<BudgetEntity> scope = new LambdaUpdateWrapper<BudgetEntity>()
                .eq(BudgetEntity::getId, id)
                .eq(BudgetEntity::getUserId, userId);
        if (budgetMapper.delete(scope) != 1) {
            throw new ResourceNotFoundException("预算不存在");
        }
    }

    private BudgetEntity requireBudget(UUID userId, UUID id) {
        BudgetEntity entity = budgetMapper.selectOne(new LambdaQueryWrapper<BudgetEntity>()
                .eq(BudgetEntity::getId, id)
                .eq(BudgetEntity::getUserId, userId));
        if (entity == null) {
            throw new ResourceNotFoundException("预算不存在");
        }
        return entity;
    }

    private boolean exists(UUID userId, LocalDate month) {
        return budgetMapper.selectCount(new LambdaQueryWrapper<BudgetEntity>()
                .eq(BudgetEntity::getUserId, userId)
                .eq(BudgetEntity::getMonth, month)) > 0;
    }

    private LocalDate requireMonthStart(LocalDate month) {
        if (month == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "month 不能为空");
        }
        if (month.getDayOfMonth() != 1) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "month 必须是当月第一天");
        }
        return month;
    }

    private BusinessException duplicateBudget() {
        return new BusinessException(HttpStatus.CONFLICT, "该月份预算已存在");
    }
}
