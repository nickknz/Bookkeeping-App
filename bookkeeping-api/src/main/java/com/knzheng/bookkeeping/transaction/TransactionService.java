package com.knzheng.bookkeeping.transaction;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.knzheng.bookkeeping.category.CategoryEntity;
import com.knzheng.bookkeeping.category.CategoryMapper;
import com.knzheng.bookkeeping.common.exception.BusinessException;
import com.knzheng.bookkeeping.common.exception.ResourceNotFoundException;
import com.knzheng.bookkeeping.common.response.PageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionMapper transactionMapper;
    private final CategoryMapper categoryMapper;

    public TransactionService(TransactionMapper transactionMapper, CategoryMapper categoryMapper) {
        this.transactionMapper = transactionMapper;
        this.categoryMapper = categoryMapper;
    }

    public PageResponse<TransactionResponse> findPage(
        UUID userId,
        LocalDate startDate,
        LocalDate endDate,
        TransactionType type,
        Integer categoryId,
        String keyword,
        int page,
        int size
    ) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "startDate 不能晚于 endDate");
        }

        Page<TransactionRow> requestPage = new Page<>(page + 1L, size);
        IPage<TransactionRow> result = transactionMapper.selectPageByFilter(
            requestPage,
            userId,
            startDate,
            endDate,
            type == null ? null : type.getValue(),
            categoryId,
            normalizeKeyword(keyword)
        );

        return new PageResponse<>(
            result.getRecords().stream().map(TransactionResponse::from).toList(),
            result.getTotal(),
            page,
            size,
            result.getPages()
        );
    }

    public TransactionResponse findById(UUID userId, UUID id) {
        return TransactionResponse.from(requireTransaction(userId, id));
    }

    @Transactional
    public TransactionResponse create(UUID userId, CreateTransactionRequest request) {
        validateCategory(request.categoryId(), request.type());

        LocalDateTime now = LocalDateTime.now();
        TransactionEntity entity = new TransactionEntity();
        entity.setId(UUID.randomUUID());
        entity.setUserId(userId);
        entity.setCategoryId(request.categoryId());
        entity.setAmount(request.amount());
        entity.setType(request.type().getValue());
        entity.setNote(normalizeNote(request.note()));
        entity.setDate(request.date());
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        transactionMapper.insert(entity);

        return findById(userId, entity.getId());
    }

    @Transactional
    public TransactionResponse update(UUID userId, UUID id, UpdateTransactionRequest request) {
        requireTransaction(userId, id);
        validateCategory(request.categoryId(), request.type());

        LambdaUpdateWrapper<TransactionEntity> scope = new LambdaUpdateWrapper<TransactionEntity>()
                .eq(TransactionEntity::getId, id)
                .eq(TransactionEntity::getUserId, userId)
                .set(TransactionEntity::getCategoryId, request.categoryId())
                .set(TransactionEntity::getAmount, request.amount())
                .set(TransactionEntity::getType, request.type().getValue())
                .set(TransactionEntity::getNote, normalizeNote(request.note()))
                .set(TransactionEntity::getDate, request.date())
                .set(TransactionEntity::getUpdatedAt, LocalDateTime.now());
        if (transactionMapper.update(null, scope) != 1) {
            throw new ResourceNotFoundException("交易记录不存在");
        }
        return findById(userId, id);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        LambdaUpdateWrapper<TransactionEntity> scope = new LambdaUpdateWrapper<TransactionEntity>()
                .eq(TransactionEntity::getId, id)
                .eq(TransactionEntity::getUserId, userId);
        if (transactionMapper.delete(scope) != 1) {
            throw new ResourceNotFoundException("交易记录不存在");
        }
    }

    private TransactionRow requireTransaction(UUID userId, UUID id) {
        TransactionRow row = transactionMapper.selectDetailById(id, userId);
        if (row == null) {
            throw new ResourceNotFoundException("交易记录不存在");
        }
        return row;
    }

    private void validateCategory(Integer categoryId, TransactionType transactionType) {
        CategoryEntity category = categoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "分类不存在");
        }
        if (!category.getType().equals(transactionType.getValue())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "交易类型与分类类型不一致");
        }
    }

    private String normalizeNote(String note) {
        if (note == null || note.isBlank()) {
            return null;
        }
        return note.trim();
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        return keyword.trim();
    }
}
