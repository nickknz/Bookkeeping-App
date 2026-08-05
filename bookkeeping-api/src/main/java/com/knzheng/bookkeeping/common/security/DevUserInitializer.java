package com.knzheng.bookkeeping.common.security;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile({"local", "docker", "test"})
public class DevUserInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public DevUserInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        jdbcTemplate.update(
                """
                INSERT INTO users (id, email, password_hash, nickname)
                VALUES (?, 'demo@bookkeeping.local', 'AUTH_NOT_ENABLED', '演示用户')
                ON CONFLICT (id) DO NOTHING
                """,
                DevCurrentUserProvider.DEV_USER_ID
        );
    }
}
