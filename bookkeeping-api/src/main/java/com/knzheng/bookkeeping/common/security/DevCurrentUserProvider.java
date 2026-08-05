package com.knzheng.bookkeeping.common.security;

import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.util.UUID;

@Component
@Profile({"local", "docker", "test"})
public class DevCurrentUserProvider implements CurrentUserProvider {

    public static final UUID DEV_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Override
    public UUID getCurrentUserId() {
        return DEV_USER_ID;
    }
}
