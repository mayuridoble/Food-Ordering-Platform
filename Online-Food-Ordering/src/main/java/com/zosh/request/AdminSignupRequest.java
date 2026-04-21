package com.zosh.request;

import lombok.Data;

@Data
public class AdminSignupRequest {
    private String fullName;
    private String email;
    private String password;

    private CreateRestaurantRequest restaurant;
}
