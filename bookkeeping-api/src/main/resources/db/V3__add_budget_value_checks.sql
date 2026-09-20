ALTER TABLE budget
    ADD CONSTRAINT chk_budget_month_first_day CHECK (EXTRACT(DAY FROM month) = 1),
    ADD CONSTRAINT chk_budget_limit_amount_positive CHECK (limit_amount > 0);
