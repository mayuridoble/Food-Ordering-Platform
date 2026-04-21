package com.zosh.service;

import com.zosh.dto.RestaurantDto;
import com.zosh.model.Restaurant;
import com.zosh.model.User;
import com.zosh.request.CreateRestaurantRequest;

import java.util.List;

public interface RestaurantService {

    public Restaurant createRestaurant(CreateRestaurantRequest req , User user);
    public Restaurant updateRestaurant(Long restaurantId , CreateRestaurantRequest updateRequest) throws Exception;
    public void deleteRestaurant(Long restaurantId) throws Exception;

    public List<Restaurant> getAllrestaurant();

    public List<Restaurant> searchRestaurant(String keyword);

    public Restaurant findRestaurantById(Long id) throws Exception;
    public Restaurant getRestaurantByUserId(Long userId) throws Exception;

    public RestaurantDto addFavourites(Long resid,User user)throws Exception;

    public Restaurant updateRestaurantStatus(Long id) throws Exception;



}
