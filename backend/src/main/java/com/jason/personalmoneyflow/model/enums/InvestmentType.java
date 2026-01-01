package com.jason.personalmoneyflow.model.enums;

public enum InvestmentType {
    STOCK("Stock", "📈"),
    ETF("ETF", "📊"),
    CRYPTO("Crypto", "₿"),
    BOND("Bond", "📜"),
    OTHER("Other", "💼");

    private final String displayName;
    private final String icon;

    InvestmentType(String displayName, String icon) {
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
