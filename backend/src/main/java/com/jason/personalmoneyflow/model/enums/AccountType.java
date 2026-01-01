package com.jason.personalmoneyflow.model.enums;

public enum AccountType {
    TFSA("TFSA", "🇨🇦"),
    RRSP("RRSP", "🏦"),
    RESP("RESP", "🎓"),
    FHSA("FHSA", "🏠"),
    NON_REGISTERED("Non-Registered", "💼"),
    OTHER("Other", "📊");

    private final String displayName;
    private final String icon;

    AccountType(String displayName, String icon) {
        this.displayName = displayName;
        this.icon = icon;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIcon() {
        return icon;
    }
}
