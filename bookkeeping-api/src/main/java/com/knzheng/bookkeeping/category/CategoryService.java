package com.knzheng.bookkeeping.category;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.knzheng.bookkeeping.common.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class CategoryService {

    private static final Set<String> TYPES = Set.of("expense", "income");

    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public List<CategoryResponse> findAll(String requestedType) {
        String type = normalizeType(requestedType);
        LambdaQueryWrapper<CategoryEntity> query = new LambdaQueryWrapper<CategoryEntity>()
                .eq(type != null, CategoryEntity::getType, type)
                .orderByAsc(CategoryEntity::getSortOrder)
                .orderByAsc(CategoryEntity::getId);
        return categoryMapper.selectList(query).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    private String normalizeType(String requestedType) {
        if (requestedType == null || requestedType.isBlank()) {
            return null;
        }
        String type = requestedType.toLowerCase(Locale.ROOT);
        if (!TYPES.contains(type)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "type 必须是 expense 或 income");
        }
        return type;
    }
}
