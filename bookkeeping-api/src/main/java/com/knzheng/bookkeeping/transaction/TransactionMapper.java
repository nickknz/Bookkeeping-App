package com.knzheng.bookkeeping.transaction;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.UUID;

@Mapper
public interface TransactionMapper extends BaseMapper<TransactionEntity> {

    IPage<TransactionRow> selectPageByFilter(
            Page<TransactionRow> page,
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") String type,
            @Param("categoryId") Integer categoryId,
            @Param("keyword") String keyword
    );

    TransactionRow selectDetailById(
            @Param("id") UUID id,
            @Param("userId") UUID userId
    );
}
