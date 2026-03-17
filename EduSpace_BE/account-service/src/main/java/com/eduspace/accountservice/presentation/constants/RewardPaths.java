package com.eduspace.accountservice.presentation.constants;

public final class RewardPaths {
    private RewardPaths() {
    }

    public static final String BASE_PATH = BaseApiPaths.BASE + "/rewards";
    public static final String TRANSACTIONS = "/transactions/{userId}";
}
