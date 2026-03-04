// CategoryRequest.java

package com.jason.personalmoneyflow.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {
    @NotBlank
    @Size(max = 50)
    private String categoryType;

    @NotBlank
    @Size(max = 100)
    private String categoryName;

    @Size(max = 50)
    private String icon;

    @Size(max = 7)
    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "Color must be a hex value like #RRGGBB")
    private String color;
}
