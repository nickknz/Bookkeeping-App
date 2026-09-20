package com.knzheng.bookkeeping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookkeepingApiApplicationTests {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanData() {
        jdbcTemplate.update("DELETE FROM budget");
        jdbcTemplate.update("DELETE FROM transactions");
        jdbcTemplate.update(
                "DELETE FROM users WHERE id <> ?",
                UUID.fromString("00000000-0000-0000-0000-000000000001")
        );
    }

    @Test
    void returnsSeededExpenseCategories() throws Exception {
        mockMvc.perform(get("/api/categories").param("type", "expense"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(15))
                .andExpect(jsonPath("$.data[0].code").value("food"))
                .andExpect(jsonPath("$.data[0].icon").value("food"));
    }

    @Test
    void completesTransactionCrudLifecycle() throws Exception {
        Integer foodId = categoryId("food");
        Integer salaryId = categoryId("salary");

        String createBody = """
                {
                  "categoryId": %d,
                  "amount": 32.50,
                  "type": "expense",
                  "note": "午餐",
                  "date": "2026-08-03"
                }
                """.formatted(foodId);

        String createResponse = mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.category.code").value("food"))
                .andExpect(jsonPath("$.data.amount").value(32.5))
                .andReturn().getResponse().getContentAsString();

        JsonNode created = objectMapper.readTree(createResponse).path("data");
        String transactionId = created.path("id").asText();

        mockMvc.perform(get("/api/transactions")
                        .param("startDate", "2026-08-01")
                        .param("endDate", "2026-08-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.records[0].id").value(transactionId));

        mockMvc.perform(get("/api/transactions/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.note").value("午餐"));

        String updateBody = """
                {
                  "categoryId": %d,
                  "amount": 15000.00,
                  "type": "income",
                  "note": "工资",
                  "date": "2026-08-03"
                }
                """.formatted(salaryId);

        mockMvc.perform(put("/api/transactions/{id}", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.type").value("income"))
                .andExpect(jsonPath("$.data.category.code").value("salary"));

        mockMvc.perform(delete("/api/transactions/{id}", transactionId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/transactions/{id}", transactionId))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsCategoryAndTransactionTypeMismatch() throws Exception {
        Integer salaryId = categoryId("salary");
        String body = """
                {
                  "categoryId": %d,
                  "amount": 20.00,
                  "type": "expense",
                  "date": "2026-08-03"
                }
                """.formatted(salaryId);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("交易类型与分类类型不一致"));
    }

    @Test
    void scopesTransactionOperationsToTheCurrentUser() throws Exception {
        UUID otherUserId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();
        Integer foodId = categoryId("food");
        jdbcTemplate.update(
                "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
                otherUserId,
                otherUserId + "@example.com",
                "NOT_USED"
        );
        jdbcTemplate.update(
                """
                INSERT INTO transactions
                    (id, user_id, category_id, amount, type, date)
                VALUES (?, ?, ?, 12.00, 'expense', DATE '2026-08-03')
                """,
                transactionId,
                otherUserId,
                foodId
        );

        mockMvc.perform(get("/api/transactions")
                        .param("startDate", "2026-08-01")
                        .param("endDate", "2026-08-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(0));

        mockMvc.perform(get("/api/transactions/{id}", transactionId))
                .andExpect(status().isNotFound());

        String updateBody = """
                {
                  "categoryId": %d,
                  "amount": 99.00,
                  "type": "expense",
                  "date": "2026-08-03"
                }
                """.formatted(foodId);

        mockMvc.perform(put("/api/transactions/{id}", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/transactions/{id}", transactionId))
                .andExpect(status().isNotFound());

        Integer remaining = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM transactions WHERE id = ?",
                Integer.class,
                transactionId
        );
        org.assertj.core.api.Assertions.assertThat(remaining).isEqualTo(1);
    }

    @Test
    void returnsBadRequestForMalformedQueryAndPathValues() throws Exception {
        mockMvc.perform(get("/api/transactions/not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        mockMvc.perform(get("/api/transactions").param("startDate", "03-08-2026"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        mockMvc.perform(get("/api/transactions").param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    private Integer categoryId(String code) {
        return jdbcTemplate.queryForObject(
                "SELECT id FROM category WHERE code = ?",
                Integer.class,
                code
        );
    }
}
