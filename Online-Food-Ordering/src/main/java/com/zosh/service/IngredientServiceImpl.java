package com.zosh.service;

import com.zosh.model.IngredientCategory;
import com.zosh.model.IngredientsItems;
import com.zosh.model.Restaurant;
import com.zosh.repository.IngredientCategoryRepository;
import com.zosh.repository.IngredientItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IngredientServiceImpl implements IngreduentsService{

    @Autowired
    private IngredientItemRepository ingredientItemRepository;
    @Autowired
    private IngredientCategoryRepository ingredientCategoryRepository;
    @Autowired
    private RestaurantService restaurantService;
    @Override
    public IngredientCategory createIngredientCategory(String name, Long id) throws Exception {
        Restaurant restaurant = restaurantService.findRestaurantById(id);

        IngredientCategory category= new IngredientCategory();
        category.setRestaurant(restaurant);
        category.setName(name);
        return ingredientCategoryRepository.save(category);
    }

    @Override
    public IngredientCategory findIngredientCategory(Long id) throws Exception {

        Optional<IngredientCategory> opt = ingredientCategoryRepository.findById(id);

        if(opt.isEmpty()) throw new Exception("Ingredient Category Not Found....");


        return opt.get();
    }

    @Override
    public List<IngredientCategory> findIngredientCategoryByRestaurantId(Long id) throws Exception {

        restaurantService.findRestaurantById(id);
        return ingredientCategoryRepository.findByRestaurantId(id);
    }

    @Override
    public IngredientsItems createIngredientItem(long restaurantId, String ingredientName, Long categoryId) throws Exception {

        Restaurant restaurant = restaurantService.findRestaurantById(restaurantId);

        IngredientCategory category = findIngredientCategory(categoryId);
        IngredientsItems ingredientsItems = new IngredientsItems();
        ingredientsItems.setName(ingredientName);
        ingredientsItems.setRestaurant(restaurant);
        ingredientsItems.setCategory(category);

        IngredientsItems saveIngredientItem = ingredientItemRepository.save(ingredientsItems);
        category.getIngredients().add(saveIngredientItem);

        return saveIngredientItem;
    }

    @Override
    public List<IngredientsItems> findRestaurantIngredientsItem(Long id) throws Exception {
        return ingredientItemRepository.findByRestaurantId(id);
    }

    @Override
    public IngredientsItems updateStock(Long id) throws Exception {
        Optional<IngredientsItems> opt = ingredientItemRepository.findById(id);

        if(opt.isEmpty()) throw new Exception("ingredient not found...");

        IngredientsItems ingredientsItems = opt.get();
        ingredientsItems.setInStock(!ingredientsItems.isInStock());
        return ingredientItemRepository.save(ingredientsItems);
    }
}
