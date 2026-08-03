package com.knzheng.bookkeeping.category;

public record CategoryResponse(
        Integer id,
        String code,
        String name,
        String icon,
        String type
) {
    public static CategoryResponse from(CategoryEntity entity) {
        return new CategoryResponse(
                entity.getId(),
                entity.getCode(),
                entity.getName(),
                entity.getIcon(),
                entity.getType()
        );
    }
}
