package com.zosh.dto;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Transient;

import lombok.Data;

import java.util.List;

@Data
@Embeddable
public class RestaurantDto {

    private String title;

    /**
     * Not stored in the favorites embeddable table — JPA cannot map List with @Column.
     * Still populated in API responses when built in code; ignored on persist.
     */
    @Transient
    private List<String> images;

    private String description;

    private Long id;

}