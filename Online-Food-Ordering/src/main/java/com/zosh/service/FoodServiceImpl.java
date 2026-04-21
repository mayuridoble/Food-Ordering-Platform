package com.zosh.service;

import com.zosh.model.Category;
import com.zosh.model.Food;
import com.zosh.model.Restaurant;
import com.zosh.repository.CategoryRepository;
import com.zosh.repository.FoodRepository;
import com.zosh.request.CreateFoodRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FoodServiceImpl implements FoodService {


    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private CategoryRepository categoryRepository;
    @Override
    public Food createFood(CreateFoodRequest req, Category category, Restaurant restaurant) {

        Category resolvedCategory = null;
        if (category != null) {
            if (category.getId() != null) {
                resolvedCategory = categoryRepository.findById(category.getId()).orElse(null);
            } else if (category.getName() != null && !category.getName().trim().isEmpty()) {
                String name = category.getName().trim();
                resolvedCategory = categoryRepository.findByRestaurantIdAndNameIgnoreCase(restaurant.getId(), name);
                if (resolvedCategory == null) {
                    Category newCategory = new Category();
                    newCategory.setName(name);
                    newCategory.setRestaurant(restaurant);
                    resolvedCategory = categoryRepository.save(newCategory);
                }
            }
        }

        Food food = new Food();
        food.setFoodCategory(resolvedCategory);
        food.setRestaurant(restaurant);
        food.setDescription(req.getDescription());
        food.setImages(req.getImages());
        food.setName(req.getName());
        food.setPrice(req.getPrice());
        food.setIngredients(req.getIngredients());
        food.setSeasonal(req.isSeasonal());
        food.setVegetarian(req.isVegetarian());
        food.setAvailable(true);
        food.setCreationDate(new Date());

        Food savedFood =  foodRepository.save(food);
        restaurant.getFoods().add(savedFood);
         return savedFood;

    }

    @Override
    public void deleteFood(Long foodId) throws Exception {

        Food food = findFoodById(foodId);
        food.setRestaurant(null);
        foodRepository.save(food);
    }

    @Override
    public List<Food> getRestaurantsFood(Long restaurantId, boolean isVegetarain, boolean isNonveg, boolean isSeasonal, String foodCategory) {
        List<Food> foods = foodRepository.findByRestaurantId(restaurantId);

        if (isVegetarain) {
            foods = filterByVegetarian(foods, isVegetarain);
        }

        if (isNonveg) {
            foods = filterByNonveg(foods, isNonveg);
        }

        if (isSeasonal) {
            foods = filterBySeasonal(foods, isSeasonal);
        }

        if (foodCategory != null && !foodCategory.equals("")) {
            foods = filterByCategory(foods, foodCategory);
        }

        return foods;
    }

    private List<Food> filterBySeasonal(List<Food> foods, boolean isSeasonal) {
        return foods.stream().filter(food ->food.isSeasonal() == isSeasonal).collect(Collectors.toList());

    }

    private List<Food> filterByCategory(List<Food> foods, String foodCategory) {

        return foods.stream().filter(food -> {
            if (food.getFoodCategory() != null) {
                return food.getFoodCategory().getName().equals(foodCategory);
            }
            return false;
        }).collect(Collectors.toList());
    }

    private List<Food> filterByNonveg(List<Food> foods, boolean isNonveg) {
        return foods.stream().filter(food ->!food.isVegetarian()).collect(Collectors.toList());

    }

    private List<Food> filterByVegetarian(List<Food> foods, boolean isVegetarain) {

        return foods.stream().filter(food ->food.isVegetarian() == isVegetarain).collect(Collectors.toList());
    }

    @Override
    public List<Food> searchFood(String keyword) {
        return foodRepository.searchFood(keyword);
    }

    @Override
    public Food findFoodById(Long foodId) throws Exception {
        Optional<Food> optionalFood=foodRepository.findById(foodId);
        if(optionalFood. isEmpty()){
            throw new Exception ("food not exist...");
        }
        return optionalFood.get();
    }

    @Override
    public Food updateAvailibilityStatus(Long foodId) throws Exception {
        Food food=findFoodById(foodId) ;
        food. setAvailable(!food.isAvailable());
        return foodRepository. save(food) ;
    }
}
