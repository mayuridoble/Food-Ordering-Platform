package com.zosh.controller;

import com.zosh.dto.RestaurantDto;
import com.zosh.model.Restaurant;
import com.zosh.model.User;
import com.zosh.repository.RestaurantRepository;
import com.zosh.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @GetMapping("/profile")
    public ResponseEntity<User> findUserByJwtToken(@RequestHeader("Authorization")String jwt) throws Exception {
        User user = userService.findUserByJwtToken(jwt);

        List<RestaurantDto> favorites = user.getFavorites();
        if (favorites != null && !favorites.isEmpty()) {
            List<Long> ids = favorites.stream()
                    .map(RestaurantDto::getId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            if (!ids.isEmpty()) {
                Map<Long, Restaurant> restaurantById = restaurantRepository.findAllById(ids)
                        .stream()
                        .collect(Collectors.toMap(Restaurant::getId, Function.identity()));

                for (RestaurantDto dto : favorites) {
                    if (dto == null || dto.getId() == null) continue;
                    Restaurant restaurant = restaurantById.get(dto.getId());
                    if (restaurant == null) continue;

                    dto.setTitle(restaurant.getName());
                    dto.setDescription(restaurant.getDescription());
                    dto.setImages(restaurant.getImages());
                }
            }
        }

        return  new ResponseEntity<>(user, HttpStatus.OK);
    }
}
