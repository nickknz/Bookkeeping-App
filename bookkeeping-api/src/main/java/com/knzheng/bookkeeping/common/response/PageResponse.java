package com.knzheng.bookkeeping.common.response;

import java.util.List;

public record PageResponse<T>(
        List<T> records,
        long total,
        int page,
        int size,
        long totalPages
) {
}
