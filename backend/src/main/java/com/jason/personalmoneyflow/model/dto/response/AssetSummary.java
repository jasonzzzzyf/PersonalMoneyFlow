package com.jason.personalmoneyflow.model.dto.response;

import com.jason.personalmoneyflow.model.enums.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetSummary {
    
    private AssetType type;
    private String name;
    private BigDecimal value;
    private Boolean autoCalculated; // true for investments
}