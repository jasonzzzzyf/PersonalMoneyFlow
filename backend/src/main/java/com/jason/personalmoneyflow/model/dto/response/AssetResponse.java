package com.jason.personalmoneyflow.model.dto.response;

import com.jason.personalmoneyflow.model.enums.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetResponse {
    
    private Long id;
    private Long userId;
    private AssetType assetType;
    private String assetName;
    private BigDecimal currentValue;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}