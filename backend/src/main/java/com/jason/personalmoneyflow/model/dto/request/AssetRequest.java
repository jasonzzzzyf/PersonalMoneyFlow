package com.jason.personalmoneyflow.model.dto.request;

import com.jason.personalmoneyflow.model.enums.AssetType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetRequest {
    
    @NotNull(message = "Asset type is required")
    private AssetType assetType;
    
    @NotBlank(message = "Asset name is required")
    private String assetName;
    
    @NotNull(message = "Current value is required")
    @DecimalMin(value = "0.0", message = "Current value must be positive")
    private BigDecimal currentValue;
    
    private String notes;
}