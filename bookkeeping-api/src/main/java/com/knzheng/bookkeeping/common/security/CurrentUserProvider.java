package com.knzheng.bookkeeping.common.security;

import java.util.UUID;

public interface CurrentUserProvider {

    UUID getCurrentUserId();
}
