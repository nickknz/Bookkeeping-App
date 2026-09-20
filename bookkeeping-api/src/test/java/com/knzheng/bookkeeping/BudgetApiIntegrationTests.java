package com.knzheng.bookkeeping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.knzheng.bookkeeping.common.security.DevCurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BudgetApiIntegrationTests {

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
    void cleanBudgetsAndUsers() {
        jdbcTemplate.update("DELETE FROM budget");
        jdbcTemplate.update("DELETE FROM transactions");
        jdbcTemplate.update(
                "DELETE FROM users WHERE id <> ?",
                DevCurrentUserProvider.DEV_USER_ID
        );
    }

    @Test
    void completesBudgetCrudLifecycle() throws Exception {
        String createResponse = mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "month": "2026-10-01",
                                  "limitAmount": 1250.50
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.data.month").value("2026-10-01"))
                .andExpect(jsonPath("$.data.limitAmount").value(1250.5))
                .andReturn().getResponse().getContentAsString();

        JsonNode created = objectMapper.readTree(createResponse).path("data");
        String budgetId = created.path("id").asText();

        mockMvc.perform(get("/api/budgets").param("month", "2026-10-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(budgetId))
                .andExpect(jsonPath("$.data.month").value("2026-10-01"))
                .andExpect(jsonPath("$.data.limitAmount").value(1250.5));

        mockMvc.perform(put("/api/budgets/{id}", budgetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "limitAmount": 1500.75
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(budgetId))
                .andExpect(jsonPath("$.data.month").value("2026-10-01"))
                .andExpect(jsonPath("$.data.limitAmount").value(1500.75));

        mockMvc.perform(delete("/api/budgets/{id}", budgetId))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        mockMvc.perform(get("/api/budgets").param("month", "2026-10-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    void returnsNullWhenRequestedMonthHasNoBudget() throws Exception {
        mockMvc.perform(get("/api/budgets").param("month", "2027-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    void defaultsToTheCurrentMonthWhenMonthIsOmitted() throws Exception {
        UUID budgetId = UUID.randomUUID();
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        insertBudget(budgetId, DevCurrentUserProvider.DEV_USER_ID, currentMonth, new BigDecimal("880.00"));

        mockMvc.perform(get("/api/budgets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(budgetId.toString()))
                .andExpect(jsonPath("$.data.month").value(currentMonth.toString()))
                .andExpect(jsonPath("$.data.limitAmount").value(880.0));
    }

    @Test
    void rejectsDuplicateBudgetForTheSameUserAndMonth() throws Exception {
        String body = """
                {
                  "month": "2026-11-01",
                  "limitAmount": 600.00
                }
                """;

        mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409));

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM budget WHERE user_id = ? AND month = DATE '2026-11-01'",
                Integer.class,
                DevCurrentUserProvider.DEV_USER_ID
        );
        assertThat(count).isEqualTo(1);
    }

    @Test
    void rejectsNonFirstDayMonthAndNonPositiveAmounts() throws Exception {
        mockMvc.perform(get("/api/budgets").param("month", "2026-10-02"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "month": "2026-10-02",
                                  "limitAmount": 100.00
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        String createResponse = mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "month": "2026-10-01",
                                  "limitAmount": 100.00
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String budgetId = objectMapper.readTree(createResponse).path("data").path("id").asText();

        mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "month": "2026-12-01",
                                  "limitAmount": 0
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        mockMvc.perform(put("/api/budgets/{id}", budgetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "limitAmount": -1
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void scopesBudgetReadsAndMutationsToTheCurrentUser() throws Exception {
        UUID otherUserId = UUID.randomUUID();
        UUID otherBudgetId = UUID.randomUUID();
        LocalDate month = LocalDate.of(2026, 12, 1);
        jdbcTemplate.update(
                "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
                otherUserId,
                otherUserId + "@example.com",
                "NOT_USED"
        );
        insertBudget(otherBudgetId, otherUserId, month, new BigDecimal("900.00"));

        mockMvc.perform(get("/api/budgets").param("month", month.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(nullValue()));

        String createResponse = mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "month": "2026-12-01",
                                  "limitAmount": 500.00
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String currentUserBudgetId = objectMapper.readTree(createResponse).path("data").path("id").asText();

        mockMvc.perform(get("/api/budgets").param("month", month.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(currentUserBudgetId));

        mockMvc.perform(put("/api/budgets/{id}", otherBudgetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "limitAmount": 999.00
                                }
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/budgets/{id}", otherBudgetId))
                .andExpect(status().isNotFound());

        BigDecimal otherUserAmount = jdbcTemplate.queryForObject(
                "SELECT limit_amount FROM budget WHERE id = ?",
                BigDecimal.class,
                otherBudgetId
        );
        assertThat(otherUserAmount).isEqualByComparingTo("900.00");
    }

    private void insertBudget(UUID budgetId, UUID userId, LocalDate month, BigDecimal limitAmount) {
        jdbcTemplate.update(
                "INSERT INTO budget (id, user_id, month, limit_amount) VALUES (?, ?, ?, ?)",
                budgetId,
                userId,
                Date.valueOf(month),
                limitAmount
        );
    }
}
